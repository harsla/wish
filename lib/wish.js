"use strict";
var _ = require("underscore"),
  async = require("async"),
  jaySchema = new (require('jayschema'))(),
  express = require("express"),
  constants = require("./constants"),
  wish = module.exports;

wish.log = require("./log.js");
wish.mysql = require("./wish-mysql.js");
wish.constants = constants;

wish.databases = {};

wish.resetState = function () {
  wish.databases = {};
  delete wish.defaultDatabaseName;
};

wish.generateApp = function () {
  var app = express();
  app.use(express.urlencoded());
  app.use(express.json());
  return app;
};

wish.createContext = function (request, response) {
  return {
    internal: {
      databaseConnections: {},
      input: {},
      unsafe: {
        request: request
      },
      response: response
    }
  };
};

wish.generalErrorHandler = function (error, context) {
  if (_.isObject(error)) {
    context.internal.response.statusCode = error.errorCode;
    delete error.errorCode;
    context.internal.response.write(JSON.stringify(error));
  } else {
    context.internal.response.statusCode = error;
  }
  context.internal.response.end();
};

wish.generateError = function (errorCode, errorMessage) {
  if (errorCode < 400 || errorCode > 599) {
    this.log.warn(errorCode + " is not a valid error code");
  }
  return {
    errorCode: errorCode,
    error: errorMessage
  };
};

wish.composeContextualizedRequestHandler = function () {
  var _this = this, _arguments = arguments;
  return function (request, response) {
    _this.log.debug("handling contextualized request");
    async.waterfall([function (callback) {
      callback(undefined, _this.createContext(request, response));
    }].concat(_.rest(_arguments)),
      function (error, context) {
        if (!error || error === constants.SHORT_CIRCUIT_PROCESSORS) {
          _.first(_arguments)(error, context);
        } else if (error !== constants.SHORT_CIRCUIT_PROCESSORS_AND_RESPONDER) {
          _this.generalErrorHandler(error, context);
        }
        async.waterfall([function (callback) {
          callback(undefined, context);
        }].concat(
          _.filter(
            _.map(_.rest(_arguments).reverse(), function (f) { return f.finalize; }),
            function (n) { if (n) { return true; } return false; }
          )
        ), function (error, context) { });
      });
  };
};

wish.nullStep = function () {
  return function (context, callback) {
    callback(undefined, context);
  };
};

wish.buildStep = function (step, finalizer, errorHandler) {
  step.finalize = finalizer;
  step.errorHandler = errorHandler;
  return step;
};

wish.generateOkResponder = function () {
  var _this = this;
  return function (error, context) {
    _this.log.debug("responding ok");
    context.internal.response.statusCode = constants.HTTP_OK;
    context.internal.response.end();
  };
};

wish.generateContextResponder = function () {
  var _this = this;
  return function (error, context) {
    _this.log.debug("responding with context");
    var safeContext = _.clone(context);
    delete safeContext.internal;
    context.internal.response.statusCode = constants.HTTP_OK;
    context.internal.response.end(JSON.stringify(safeContext));
  };
};

wish.generateSchema = function (object) {
  return {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": object,
    additionalProperties: false
  };
};

wish.jsonIsValid = function (json, schema) {
  var validationErrors = jaySchema.validate(json, schema),
    schemaName = schema.title || "a",
    isValid = true;
  if (validationErrors.length !== 0) {
    wish.log.debug("validation against " + schemaName + " JSON schema failed");
    isValid = false;
  }
  return isValid;
};

wish.acceptInput = function (schema) {
  return function (context, callback) {
    _.extend(context.internal.input, context.internal.unsafe.request.body,
      context.internal.unsafe.request.query);
    _.each(context.internal.input, function (value, key) {
      if (_.isString(value) && _.has(schema, key) && schema[key].type !== "string") {
        switch (schema[key].type) {
        case "integer":
          context.internal.input[key] = parseInt(value, 10);
          break;
        case "number":
          context.internal.input[key] = parseFloat(value);
          break;
        case "boolean":
          context.internal.input[key] = value === "true";
          break;
        }
      }
    });
    if (wish.jsonIsValid(context.internal.input, wish.generateSchema(schema))) {
      callback(undefined, context);
    } else {
      callback(wish.generateError(constants.HTTP_BAD_REQUEST, "unacceptable request data"), context);
    }
  };
};

wish.configureDatabase = function (databaseFacade) {
  if (Object.keys(wish.databases).length === 0) {
    wish.defaultDatabaseName = databaseFacade.name;
  }
  wish.databases[databaseFacade.name] = databaseFacade;
};

wish.connectToDatabase = function (databaseName) {
  return function (context, callback) {
    databaseName = databaseName || wish.defaultDatabaseName;
    wish.databases[databaseName].connect(function (err, connection) {
      if (err) {
        wish.log.error(err);
        callback(wish.generateError(wish.constants.HTTP_INTERNAL_SERVER_ERROR, "error connecting to database"),
          context);
      } else {
        context.internal.databaseConnections[databaseName] = connection;
        callback(undefined, context);
      }
    });
  };
};

wish.disconnectFromDatabase = function (databaseName) {
  return function (context, callback) {
    databaseName = databaseName || wish.defaultDatabaseName;
    if (context.internal.databaseConnections[databaseName]) {
      context.internal.databaseConnections[databaseName].close();
      delete context.internal.databaseConnections[databaseName];
    }
    callback(undefined, context);
  };
};

wish.sql = function (databaseName, sql, parameters, resultSetCallback) {
  var _arguments = arguments,
    connectedImplicitly = false;
  return wish.buildStep(function (context, callback) {
    var queryClosure = function () {
      context.internal.databaseConnections[databaseName].sql(sql, parameters, function (err, resultSet) {
        if (err) {
          wish.log.error(err);
          callback(wish.generateError(wish.constants.HTTP_INTERNAL_SERVER_ERROR, "database query error"),
              context);
          return;
        }
        resultSetCallback(context, resultSet, function () {
          callback(undefined, context);
        });
      });
    };
    if (_arguments.length === 3) {
      resultSetCallback = parameters;
      parameters = sql;
      sql = databaseName;
      databaseName = wish.defaultDatabaseName;
    }
    if (context.internal.databaseConnections[databaseName] === undefined) {
      connectedImplicitly = true;
      wish.connectToDatabase(databaseName)(context, function () {
        queryClosure();
      });
    } else {
      queryClosure();
    }
  }, function (context, callback) {
    if (connectedImplicitly) {
      wish.disconnectFromDatabase(databaseName)(context, callback);
    } else {
      callback(undefined, context);
    }
  });
};