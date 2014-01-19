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
    wish.configureDatabase({name: "baz", connect: function (callback) { callback(undefined, 5); }});
    wish.connectToDatabase("baz")(context, function () {
      context.internal.databaseConnections.baz.should.equal(5);
      done();
    });
  });

  test('disconnect from database', function (done) {
    var context = wish.createContext(),
      closeCalls = 0;
    context.internal.databaseConnections.woop = {
      close: function () { closeCalls += 1; }
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
        callback(undefined, [{value: 1}]);
      }
    };
    wish.sql("paz", "select 1", [], function (context, resultSet, callback) {
      resultSet[0].value.should.equal(1);
      sawResult += 1;
      callback();
    })(context, function () {
      should.equal(sawResult, 1);
      should.equal(queryInvocation, 1);
      done();
    });
  });

  test('connect to default database', function (done) {
    wish.resetState();
    var context = wish.createContext();
    wish.configureDatabase({name: "baz", connect: function (callback) { callback(undefined, 5); }});
    wish.connectToDatabase()(context, function () {
      context.internal.databaseConnections.baz.should.equal(5);
      done();
    });
  });

  test('disconnect from default database', function (done) {
    wish.resetState();
    var context = wish.createContext(),
      closeCalls = 0;
    context.internal.databaseConnections.woop = {
      close: function () { closeCalls += 1; }
    };
    wish.defaultDatabaseName = "woop";
    wish.disconnectFromDatabase()(context, function () {
      closeCalls.should.equal(1);
      should.equal(context.internal.databaseConnections.woop, undefined);
      done();
    });
  });

  test('query the default database', function (done) {
    var context = wish.createContext(),
      queryInvocation = 0,
      sawResult = 0;
    context.internal.databaseConnections.paz = {
      sql: function (query, parameters, callback) {
        queryInvocation += 1;
        callback(undefined, [{value: 1}]);
      }
    };
    wish.defaultDatabaseName = "paz";
    wish.sql("select 1", [], function (context, resultSet, callback) {
      resultSet[0].value.should.equal(1);
      sawResult += 1;
      callback();
    })(context, function () {
      should.equal(sawResult, 1);
      should.equal(queryInvocation, 1);
      done();
    });
  });

  test('implicit database connection', function (done) {
    wish.resetState();
    wish.configureDatabase({name: "zip", connect: function (callback) { callback(undefined, {
      sql: function (query, parameters, callback) {
        callback(undefined, [{value: 99}]);
      }
    }); }});
    var context = wish.createContext();
    wish.sql("zip", "select 99", [], function (context, resultSet, callback) {
      resultSet[0].value.should.equal(99);
      callback();
    })(context, function () {
      done();
    });
  });

  test('implicit database connection to default database', function (done) {
    wish.resetState();
    wish.configureDatabase({name: "zip", connect: function (callback) { callback(undefined, {
      sql: function (query, parameters, callback) {
        callback(undefined, [{value: 99}]);
      }
    }); }});
    var context = wish.createContext();
    wish.sql("select 99", [], function (context, resultSet, callback) {
      resultSet[0].value.should.equal(99);
      callback();
    })(context, function () {
      done();
    });
  });

  test('implicit database disconnect', function (done) {
    var closeCalls = 0;
    wish.resetState();
    wish.configureDatabase({
      name: "mockdb",
      connect: function (callback) { callback(undefined, {
        sql: function (query, parameters, callback) {
          callback(undefined, [{value: 99}]);
        },
        close: function () { closeCalls += 1; }
      }); }
    });
    wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      wish.buildStep(wish.nullStep(), function PAIN(context, callback) {
        closeCalls.should.equal(1);
        done();
        callback(undefined, context);
      }),
      wish.sql("do something", [], function (context, resultSet, callback) {
        callback();
      })
      )({}, {write: function () {},
      end: function () {
        this.statusCode.should.equal(200);
      }});
  });

  test('gracefully handle implicit AND explicit database disconnect', function (done) {
    var closeCalls = 0;
    wish.resetState();
    wish.configureDatabase({
      name: "mockdb",
      connect: function (callback) { callback(undefined, {
        sql: function (query, parameters, callback) {
          callback(undefined, [{value: 99}]);
        },
        close: function () { closeCalls += 1; }
      }); }
    });
    wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      wish.buildStep(wish.nullStep(), function (context, callback) {
        closeCalls.should.equal(1);
        done();
        callback(undefined, context);
      }),
      wish.sql("do something", [], function (context, resultSet, callback) {
        callback();
      }),
      wish.disconnectFromDatabase()
      )({}, {write: function () {},
      end: function () {
        this.statusCode.should.equal(200);
      }});
  });

});