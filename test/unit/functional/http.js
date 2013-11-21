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
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.respondWithContext));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH
      },
      response: {
        statusCode: constants.HTTP_OK,
        payload: "{}"
      }
    }));

});