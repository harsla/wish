"use strict";

var _ = require("underscore"),
  constants = require("../../../lib/constants.js"),
  should = require("should"),
  wish = require("../../../lib/wish.js");

wish.log.level = constants.LOG_WARN;

suite('functional-rdbms', function () {

  test('configure database', function () {
    wish.configureDatabase({name: "foo"});
    wish.databases.foo.name.should.equal("foo");
  });

  test('connect to database', function (done) {
    var context = wish.createContext();
    wish.configureDatabase({name: "baz", connect: function (callback) { callback(5); }});
    wish.connectToDatabase("baz")(context, function () {
      context.internal.databaseConnections.baz.should.equal(5);
      done();
    });
  });

  test('disconnect from database', function (done) {
    var context = wish.createContext(),
      closeCalls = 0;
    context.internal.databaseConnections.woop = {
      close: function (callback) { closeCalls += 1; callback(); }
    };
    wish.disconnectFromDatabase("woop")(context, function () {
      closeCalls.should.equal(1);
      should.equal(context.internal.databaseConnections.woop, undefined);
      done();
    });
  });

  test('query the database', function (done) {
    var context = wish.createContext(),
      queryInvocation = 0,
      sawResult = 0;
    context.internal.databaseConnections.paz = {
      sql: function (query, parameters, callback) {
        queryInvocation += 1;
        callback([{value: 1}]);
      }
    };
    wish.sql("paz", "select 1", [], function (resultSet, callback) {
      resultSet[0].value.should.equal(1);
      sawResult += 1;
      callback();
    })(context, function () {
      should.equal(sawResult, 1);
      should.equal(queryInvocation, 1);
      done();
    });
  });

});