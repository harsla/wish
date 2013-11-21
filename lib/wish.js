"use strict";
var _ = require("underscore"),
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
    _.last(_arguments)(_this.createContext(request, response));
  };
};

wish.respondOk = function (context) {
  context.internal.response.statusCode = constants.HTTP_OK;
  context.internal.response.end();
}