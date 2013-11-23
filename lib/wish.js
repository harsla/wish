"use strict";
var _ = require("underscore"),
  async = require("async"),
  constants = require("./constants"),
  wish = module.exports;

wish.log = require("./log.js");

wish.createContext = function (request, response) {
  return {
    internal: {
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
  return {
    errorCode: errorCode,
    error: errorMessage
  };
};

wish.composeContextualizedRequestHandler = function () {
  var _this = this, _arguments = arguments;
  return function (request, response) {
    async.waterfall([function (callback) {
      callback(undefined, _this.createContext(request, response));
    }].concat(_.rest(_arguments)),
      function (error, context) {
        if (error) {
          _this.generalErrorHandler(error, context);
        } else {
          _.first(_arguments)(error, context);
        }
      });
  };
};

wish.respondOk = function (error, context) {
  context.internal.response.statusCode = constants.HTTP_OK;
  context.internal.response.end();
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

wish.respondWithContext = function (error, context) {
  this.log.debug("responding with context");
  var internal = context.internal;
  delete context.internal;
  internal.response.statusCode = constants.HTTP_OK;
  internal.response.end(JSON.stringify(context));
};