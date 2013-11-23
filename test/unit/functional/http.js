"use strict";

var niceTests = require("../../utils/nice-tests.js"),
  constants = require("../../../lib/constants.js"),
  wish = require("../../../lib/wish.js");

suite('functional-http', function () {

  var TEST_PATH = "/foo";

  test('basic service', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.respondOk));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_OK
      }
    }));

  test('context responder', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateContextResponder()));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_OK,
        payload: {}
      }
    }));

  test('context responder with payload', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      function (context, callback) {
        context.x = 3;
        callback(undefined, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_OK,
        payload: {
          x: 3
        }
      }
    }));

  test('multiple processors', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      function (context, callback) {
        context.x = 3;
        callback(undefined, context);
      },
      function (context, callback) {
        context.y = 5;
        callback(undefined, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_OK,
        payload: {
          x: 3,
          y: 5
        }
      }
    }));

  test('numeric error response', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      function (context, callback) {
        callback(constants.HTTP_INTERNAL_SERVER_ERROR, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_INTERNAL_SERVER_ERROR,
        payload: ""
      }
    }));

  test('object error response', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      function (context, callback) {
        callback(wish.generateError(constants.HTTP_INTERNAL_SERVER_ERROR, "something bad happened"), context);
      }));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_INTERNAL_SERVER_ERROR,
        payload: {
          error: "something bad happened"
        }
      }
    }));

  test('not found error', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      function (context, callback) {
        callback(constants.HTTP_NOT_FOUND, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_NOT_FOUND,
        payload: ""
      }
    }));

});