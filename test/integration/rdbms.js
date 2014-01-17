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
      wish.connectToDatabase("mysql"),
      function (context, callback) {
        Object.keys(context.internal.databaseConnections).length.should.equal(1);
        Object.keys(context.internal.databaseConnections).indexOf("mysql").should.equal(0);
        callback(undefined, context);
      },
      wish.sql("mysql", "SELECT 1 AS foo", [], function (context, resultSet, callback) {
        context.foo = resultSet[0].foo;
        callback();
      }),
      wish.disconnectFromDatabase("mysql"),
      function (context, callback) {
        Object.keys(context.internal.databaseConnections).length.should.equal(0);
        context.foo.should.equal(1);
        callback(undefined, context);
      }
      )({}, {write: function () {},
      end: function () {
        this.statusCode.should.equal(200);
        done();
      }});
  });

  test('erroneous query', function (done) {
    wish.configureDatabase(wish.mysql.configure("mysql", "mysql://wish:wish@localhost/wish"));
    wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
        wish.connectToDatabase("mysql"),
        wish.sql("mysql", "TCELES STAR FROM thingses WHERE roffel", [], function (context, resultSet, callback) {
        callback();
      }),
      wish.disconnectFromDatabase("mysql")
      )({}, {write: function () {},
      end: function () {
        this.statusCode.should.equal(500);
        done();
      }});
  });

  test('nonexistant database', function (done) {
    wish.configureDatabase(wish.mysql.configure("mysql", "mysql://wish:wish@localhost/does_not_exist"));
    wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
            wish.connectToDatabase("mysql")
        )({}, {write: function () {},
      end: function () {
        this.statusCode.should.equal(500);
        done();
      }});
  });

});