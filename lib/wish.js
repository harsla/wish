"use strict";
var _ = require("underscore"),
  async = require("async"),
  constants = require("./constants"),
  wish = module.exports;

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

wish.composeContextualizedRequestHandler = function () {
  var _this = this, _arguments = arguments;
  return function (request, response) {
    async.waterfall([function (callback) {
      callback(undefined, _this.createContext(request, response));
    }].concat(_.rest(_arguments)),
      _.first(_arguments));
  };
};

wish.respondOk = function (error, context) {
  context.internal.response.statusCode = constants.HTTP_OK;
  context.internal.response.end();
};

wish.respondWithContext = function (error, context) {
  var internal = context.internal;
  delete context.internal;
  internal.response.statusCode = constants.HTTP_OK;
  internal.response.end(JSON.stringify(context));
};