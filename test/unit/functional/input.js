"use strict";

var niceTests = require("../../utils/nice-tests.js"),
  constants = require("../../../lib/constants.js"),
  wish = require("../../../lib/wish.js");

wish.log.level = constants.LOG_INFO;

suite('functional-input', function () {

  var TEST_PATH = "/foo";

  test('query input', niceTests.createAndTestService(function (app) {
    app.post(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateOkResponder(),
      wish.acceptInput(wish.generateSchema({
        "bar": {
          "type": "string"
        }
      })),
      function (context, callback) {
        context.internal.input.bar.should.equal("baz");
        callback(undefined, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_POST,
        path: TEST_PATH + "?bar=baz"
      },
      response: {
        statusCode: constants.HTTP_OK
      }
    }));

  test('basic form input (application/x-www-form-urlencoded)', niceTests.createAndTestService(function (app) {
    app.post(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateOkResponder(),
      wish.acceptInput(wish.generateSchema({
        "bar": {
          "type": "string"
        }
      })),
      function (context, callback) {
        context.internal.input.bar.should.equal("baz");
        callback(undefined, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_POST,
        path: TEST_PATH,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "bar=baz"
      },
      response: {
        statusCode: constants.HTTP_OK
      }
    }));

  test('json input (application/json)', niceTests.createAndTestService(function (app) {
    app.post(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateOkResponder(),
      wish.acceptInput(wish.generateSchema({
        "bar": {
          "type": "string"
        }
      })),
      function (context, callback) {
        context.internal.input.bar.should.equal("baz");
        callback(undefined, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_POST,
        path: TEST_PATH,
        headers: {
          "Content-Type": "application/json"
        },
        body: "{\"bar\":\"baz\"}"
      },
      response: {
        statusCode: constants.HTTP_OK
      }
    }));

  test('constraint violation => HTTP 400 bad request', niceTests.createAndTestService(function (app) {
    app.post(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateOkResponder(),
      wish.acceptInput(wish.generateSchema({
        "bar": {
          "type": "string",
          maxLength: 1
        }
      })),
      function (context, callback) {
        context.internal.input.bar.should.equal("baz");
        callback(undefined, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_POST,
        path: TEST_PATH + "?bar=baz"
      },
      response: {
        statusCode: constants.HTTP_BAD_REQUEST
      }
    }));

});