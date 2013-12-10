"use strict";
var _ = require("underscore"),
  async = require("async"),
  jaySchema = new (require('jayschema'))(),
  constants = require("./constants"),
  wish = module.exports;

wish.log = require("./log.js");

wish.createContext = function (request, response) {
  return {
    internal: {
      input: {},
      unsafe: {
        request: request
      },
      response: response
    }
  };
};

wish.generalErrorHandler = function (error, context) {
  this.log.debug("handling error");
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
      });
  };
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
    var internal = context.internal;
    delete context.internal;
    internal.response.statusCode = constants.HTTP_OK;
    internal.response.end(JSON.stringify(context));
  };
};

wish.generateSchema = function (object) {
  return {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": object
  };
}

wish.jsonIsValid = function (json, schema) {
  return jaySchema.validate(json, schema).length === 0;
};

wish.acceptInput = function (schema) {
  var _this = this;
  return function (context, callback) {
    _.extend(context.internal.input, context.internal.unsafe.request.body,
      context.internal.unsafe.request.query);
    if (wish.jsonIsValid(context.internal.input, schema)) {
      callback(undefined, context);
    } else {
      callback(wish.generateError(constants.HTTP_BAD_REQUEST, "unacceptable request data"), context);
    }

  };
};