"use strict";
var _ = require("underscore"),
  async = require("async"),
  jaySchema = new (require('jayschema'))(),
  express = require("express"),
  constants = require("./constants"),
  wish = module.exports;;

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

wish.generalErrorHandler = function (error, context, callback) {
  if (_.isObject(error)) {
    context.internal.response.statusCode = error.errorCode;
    delete error.errorCode;
    context.internal.response.write(JSON.stringify(error));
  } else {
    context.internal.response.statusCode = error;
  }
  context.internal.response.end();
  callback(error, context);
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

wish.waterfall = function () {
  var responder = arguments[0],
    steps = _.rest(arguments),
    finalizers = [],
    cleaner = function (error, context) {
      if (finalizers.length !== 0) {
        finalizers.shift()(context, cleaner);
      }
    },
    executor = function (error, context) {
      if (error === constants.SHORT_CIRCUIT_PROCESSORS_AND_RESPONDER) {
        cleaner(error, context);
      } else if(error === constants.SHORT_CIRCUIT_PROCESSORS || (!error && steps.length === 0)) {
        responder(error, context, cleaner);
      } else if (error) {
        wish.generalErrorHandler(error, context, cleaner);
      } else {
        var currentStep = steps.shift();
        if (currentStep.finalize) {
          finalizers.unshift(currentStep.finalize);
        }
        currentStep(context, executor);
      }
    };
  executor(undefined, undefined);
};

wish.composeContextualizedRequestHandler = function () {
  var tasks = arguments;
  return function (request, response) {
    wish.log.debug("handling contextualized response");
    wish.waterfall.apply(this,
      [
        tasks[0],
        function (context, callback) {
          callback(undefined, wish.createContext(request, response));
        }
      ]
      .concat(_.rest(tasks)));
  };
};

wish.nullStep = function () {
  return function (context, callback) {
    callback(undefined, context);
  };
};

wish.buildStep = function (step, finalizer) {
  step.finalize = finalizer;
  return step;
};

wish.generateOkResponder = function () {
  var _this = this;
  return function (error, context, callback) {
    _this.log.debug("responding ok");
    context.internal.response.statusCode = constants.HTTP_OK;
    context.internal.response.end();
    callback(error, context, callback);
  };
};

wish.generateContextResponder = function () {
  var _this = this;
  return function (error, context, callback) {
    _this.log.debug("responding with context");
    var safeContext = _.clone(context);
    delete safeContext.internal;
    context.internal.response.statusCode = constants.HTTP_OK;
    context.internal.response.end(JSON.stringify(safeContext));
    callback(error, context);
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
        context.internal.input[key] = wish.stringFromType(schema[key].type, value);
      }
    });
    if (wish.jsonIsValid(context.internal.input, wish.generateSchema(schema))) {
      callback(undefined, context);
    } else {
      callback(wish.generateError(constants.HTTP_BAD_REQUEST, "unacceptable request data"), context);
    }
  };
};

wish.stringFromType = function (type, value) {
  switch (type) {
  case "integer":
    return parseInt(value, 10);
  case "number":
    return parseFloat(value);
  case "boolean":
    return value === "true";
  default:
    return undefined;
  }
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
    if (_arguments.length === 3) {
      resultSetCallback = parameters;
      parameters = sql;
      sql = databaseName;
      databaseName = wish.defaultDatabaseName;
    }
    if (context.internal.databaseConnections[databaseName] === undefined) {
      connectedImplicitly = true;
      wish.connectToDatabase(databaseName)(context, function () {
        context.internal.databaseConnections[databaseName].sql(sql, parameters,
          wish.generateQueryResultHandler(context, resultSetCallback, callback));
      });
    } else {
      context.internal.databaseConnections[databaseName].sql(sql, parameters,
        wish.generateQueryResultHandler(context, resultSetCallback, callback));
    }
  }, function (context, callback) {
    if (connectedImplicitly) {
      wish.disconnectFromDatabase(databaseName)(context, callback);
    } else {
      callback(undefined, context);
    }
  });
};

wish.generateQueryResultHandler = function (context, resultSetCallback, callback) {
  return function (err, resultSet) {
    if (err) {
      wish.log.error(err);
      callback(wish.generateError(wish.constants.HTTP_INTERNAL_SERVER_ERROR, "database query error"),
        context);
      return;
    }
    resultSetCallback(context, resultSet, function () {
      callback(undefined, context);
    });
  }
};
