"use strict";

var _ = require("underscore"),
  constants = require("../../../lib/constants.js"),
  should = require("should"),
  wish = require("../../../lib/wish.js"),
  testDatabaseFacade = { // a faked out database driver for unit testing
    name: "testDatabase",
    connect: function (callback) {
      callback(undefined, this.databaseConnection);
    },
    // the following properties are for unit testing and would not normally appear in a database facade
    databaseConnection: {
      closeInvocationCount: 0,
      close: function () { this.closeInvocationCount += 1; },
      sqlInvocationCount: 0,
      sql: function (query, parameters, callback) {
        this.sqlInvocationCount += 1;
        callback(undefined, this.resultSet);
      },
      resultSet: {}
    },
    resetState: function () {
      this.databaseConnection.closeInvocationCount = 0;
      this.databaseConnection.sqlInvocationCount = 0;
    }
  };

wish.log.level = constants.LOG_WARN;

suite('functional-rdbms', function () {
  setup(function () {
    wish.resetState();
    testDatabaseFacade.resetState();
  });

  test('configure database', function () {
    // given
    wish.configureDatabase({name: "foo"});
    // expect
    wish.databases.foo.name.should.equal("foo");
  });

  test('connect to database', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.connectToDatabase("testDatabase")(context, function () {
      // expect
      context.internal.databaseConnections.testDatabase.should.equal(testDatabaseFacade.databaseConnection);
      done();
    });
  });

  test('disconnect from database', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.connectToDatabase("testDatabase")(context, function () {
      wish.disconnectFromDatabase("testDatabase")(context, function () {
        // expect
        testDatabaseFacade.databaseConnection.closeInvocationCount.should.equal(1);
        should.equal(context.internal.databaseConnections.testDatabaseFacade, undefined);
        done();
      });
    });
  });

  test('query the database', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.connectToDatabase("testDatabase")(context, function () {
      wish.sql("testDatabase", "SELECT 1", [], function (context, resultSet, callback) {
        // expect
        resultSet.should.equal(testDatabaseFacade.databaseConnection.resultSet);
        should.equal(testDatabaseFacade.databaseConnection.sqlInvocationCount, 1);
        done();
      })(context, undefined);
    });
  });

  test('connect to default database', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.connectToDatabase()(context, function () {
      // expect
      context.internal.databaseConnections.testDatabase.should.equal(testDatabaseFacade.databaseConnection);
      done();
    });
  });

  test('disconnect from default database', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.connectToDatabase()(context, function () {
      wish.disconnectFromDatabase("testDatabase")(context, function () {
        // expect
        testDatabaseFacade.databaseConnection.closeInvocationCount.should.equal(1);
        should.equal(context.internal.databaseConnections.testDatabaseFacade, undefined);
        done();
      });
    });
  });

  test('query the default database', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.connectToDatabase("testDatabase")(context, function () {
      wish.sql("SELECT 1", [], function (context, resultSet, callback) {
        // expect
        resultSet.should.equal(testDatabaseFacade.databaseConnection.resultSet);
        should.equal(testDatabaseFacade.databaseConnection.sqlInvocationCount, 1);
        done();
      })(context, undefined);
    });
  });

  test('implicit database connection', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.sql("testDatabase", "SELECT 1", [], function (context, resultSet, callback) {
      // expect
      resultSet.should.equal(testDatabaseFacade.databaseConnection.resultSet);
      should.equal(testDatabaseFacade.databaseConnection.sqlInvocationCount, 1);
      done();
    })(context, undefined);
  });

  test('implicit database connection to default database', function (done) {
    // let
    var context = wish.createContext();
    // given
    wish.configureDatabase(testDatabaseFacade);
    wish.sql("SELECT 1", [], function (context, resultSet, callback) {
      // expect
      resultSet.should.equal(testDatabaseFacade.databaseConnection.resultSet);
      should.equal(testDatabaseFacade.databaseConnection.sqlInvocationCount, 1);
      done();
    })(context, undefined);
  });

  test('implicit database disconnect', function (done) {
    // let
    wish.configureDatabase(testDatabaseFacade);
    // given
    wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      wish.buildStep(wish.nullStep(), function (context, callback) {
        // expect
        testDatabaseFacade.databaseConnection.sqlInvocationCount.should.equal(1);
        testDatabaseFacade.databaseConnection.closeInvocationCount.should.equal(1);
        done();
      }),
      wish.sql("do something", [], function (context, resultSet, callback) {
        resultSet.should.equal(testDatabaseFacade.databaseConnection.resultSet);
        callback();
      })
    )({}, {write: _.constant(),
      end: _.constant() });
  });

  test('gracefully handle implicit AND explicit database disconnect', function (done) {
    // let
    wish.configureDatabase(testDatabaseFacade);
    // given
    wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
      wish.buildStep(wish.nullStep(), function (context, callback) {
        // expect
        testDatabaseFacade.databaseConnection.sqlInvocationCount.should.equal(1);
        testDatabaseFacade.databaseConnection.closeInvocationCount.should.equal(1);
        done();
      }),
      wish.sql("do something", [], function (context, resultSet, callback) {
        resultSet.should.equal(testDatabaseFacade.databaseConnection.resultSet);
        callback();
      }),
      wish.disconnectFromDatabase()
    )({}, {write: _.constant(),
      end: _.constant() });
  });

});
