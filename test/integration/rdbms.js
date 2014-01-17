"use strict";

var _ = require("underscore"),
  niceTests = require("../utils/nice-tests.js"),
  constants = require("../../lib/constants.js"),
  wish = require("../../lib/wish.js");

wish.log.level = constants.LOG_WARN;

suite('rdbms-integration', function () {

  var TEST_PATH = "/foo";

  test('select 1', function (done) {
    wish.configureDatabase(wish.mysql.configure("mysql", "mysql://wish:wish@localhost/wish"));
    wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      wish.connectToDatabase("mysql")
      )({}, {write: function () {},
      end: function () {
        this.statusCode.should.equal(200);
        done();
      }});
  });

});