"use strict";

var _ = require("underscore"),
  niceTests = require("../utils/nice-tests.js"),
  constants = require("../../lib/constants.js"),
  wish = require("../../lib/wish.js");

wish.log.level = constants.LOG_WARN;

suite('rdbms-integration', function () {

  var TEST_PATH = "/foo";

  test('select now', function () {
    wish.composeContextualizedRequestHandler(wish.generateOkResponder())({}, {end: function () {}});
  });

});