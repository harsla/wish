"use strict";

var niceTests = require("../../utils/nice-tests.js"),
  constants = require("../../../lib/constants.js"),
  wish = require("../../../lib/wish.js");

wish.log.level = constants.LOG_WARN;

suite('functional-input', function () {

  var TEST_PATH = "/foo";

  test('query input', niceTests.createAndTestService(function (app) {
    app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateOkResponder(),
      wish.acceptInput({
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "bar": {
            "type": "string"
          }
        }
      }),
      function (context, callback) {
        context.internal.input.bar.should.equal("baz");
        callback(undefined, context);
      }));
  },
    {
      request: {
        method: constants.HTTP_GET,
        path: TEST_PATH + "?bar=baz"
      },
      response: {
        statusCode: constants.HTTP_OK
      }
    }));
});