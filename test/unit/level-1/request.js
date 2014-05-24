"use strict";

var niceTests = require("../../utils/nice-tests.js"),
  constants = require("../../../lib/constants.js"),
  wish = require("../../../lib/wish.js");

wish.log.level = constants.LOG_WARN;

suite('request-handling', function () {

  // test('basic service', niceTests.createAndTestService(function (app) {
  //   app.get(TEST_PATH, wish.composeContextualizedRequestHandler(wish.generateOkResponder()));
  // },
  //   {
  //     request: {
  //       method: constants.HTTP_GET,
  //       path: TEST_PATH
  //     },
  //     response: {
  //       statusCode: constants.HTTP_OK
  //     }
  //   }));

});
