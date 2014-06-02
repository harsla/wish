"use strict";

var _ = require("underscore"),
  niceTests = require("../../utils/nice-tests.js"),
  constants = require("../../../lib/constants.js"),
  wish = require("../../../lib/wish.js");

wish.log.level = constants.LOG_WARN;

suite('request-control-flow', function () {

  test('normal flow', function (done) {
    // let
    var x = 0,
      assertMilestone = function (expectedMilestone) {
        x += 1;
        x.should.equal(expectedMilestone);
      }, milestoneStep = function (expectedMilestone) {
        return function (context, callback) {
          assertMilestone(expectedMilestone);
          callback(undefined, context);
        }
      },
      milestoneFinalizer = function (milestone) {
        assertMilestone(milestone);
          done();
      };
    // given, expect
    wish.composeContextualizedRequestHandler(
      function responder (context) {
        assertMilestone(4);
        done();
      },
      milestoneStep(1),
      milestoneStep(2),
      milestoneStep(3))({}, {});
  });

  test('faulty flow', function (done) {
    var x = 0;
    wish._generalErrorHandler = wish.generalErrorHandler;
    wish.generalErrorHandler = function (error, context) {
      x += 1;
      x.should.equal(4);
      wish.generalErrorHandler = wish._generalErrorHandler;
      delete wish._generalErrorHandler;
      wish.generalErrorHandler(error, context);
      done();
    }
    wish.composeContextualizedRequestHandler(
      function responder (context) {
        assert.fail();
      }, function stepOne (context, callback) {
        x += 1;
        x.should.equal(1);
        callback(undefined, context);
      }, function stepTwo (context, callback) {
        x += 1;
        x.should.equal(2);
        callback(undefined, context);
      }, function stepThree (context, callback) {
        x += 1;
        x.should.equal(3);
        callback(wish.generateError(500,"boop"), context);
      })({}, {write:_.constant(), end:_.constant()});
  });

  test('alternate faulty flow', function (done) {
    var x = 0;
    wish._generalErrorHandler = wish.generalErrorHandler;
    wish.generalErrorHandler = function (error, context) {
      x += 1;
      x.should.equal(2);
      wish.generalErrorHandler = wish._generalErrorHandler;
      delete wish._generalErrorHandler;
      wish.generalErrorHandler(error, context);
      done();
    }
    wish.composeContextualizedRequestHandler(
      function responder (context) {
        assert.fail();
      }, function stepOne (context, callback) {
        x += 1;
        x.should.equal(1);
        callback(wish.generateError(500,"boop"), context);
      }, function stepTwo (context, callback) {
        assert.fail();
      }, function stepThree (context, callback) {
        assert.fail();
      })({}, {write:_.constant(), end:_.constant()});
  });

  test('normal flow with finalizers', function (done) {
    var x = 0;
    wish.composeContextualizedRequestHandler(
      function responder (context) {
        x += 1;
        x.should.equal(4);
      }, wish.buildStep(function stepOne (context, callback) {
        x += 1;
        x.should.equal(1);
        callback(undefined, context);
      }, function finalizerOne (context, callback) {
        x += 1;
        x.should.equal(7);
        done();
        callback(undefined, context);
      }), wish.buildStep(function stepTwo (context, callback) {
        x += 1;
        x.should.equal(2);
        callback(undefined, context);
      }, function finalizerTwo (context, callback) {
        x += 1;
        x.should.equal(6);
        callback(undefined, context);
      }), wish.buildStep(function stepThree (context, callback) {
        x += 1;
        x.should.equal(3);
        callback(undefined, context);
      }, function finalizerThree (context, callback) {
        x += 1;
        x.should.equal(5);
        callback(undefined, context);
      }))({}, {});
  });

  test('faulty flow with finalizers', function (done) {
    var x = 0;
    wish._generalErrorHandler = wish.generalErrorHandler;
    wish.generalErrorHandler = function (error, context) {
      x += 1;
      x.should.equal(4);
      wish.generalErrorHandler = wish._generalErrorHandler;
      delete wish._generalErrorHandler;
      wish.generalErrorHandler(error, context);
    }
    wish.composeContextualizedRequestHandler(
        function responder (context) {
          assert.fail();
        }, wish.buildStep(function stepOne (context, callback) {
          x += 1;
          x.should.equal(1);
          callback(undefined, context);
        }, function finalizerOne (context, callback) {
          x += 1;
          x.should.equal(7);
          done();
          callback(undefined, context);
        }), wish.buildStep(function stepTwo (context, callback) {
          x += 1;
          x.should.equal(2);
          callback(undefined, context);
        }, function finalizerTwo (context, callback) {
          x += 1;
          x.should.equal(6);
          callback(undefined, context);
        }), wish.buildStep(function stepThree (context, callback) {
          x += 1;
          x.should.equal(3);
          callback(wish.generateError(500,"boop"), context);
        }, function finalizerThree (context, callback) {
          x += 1;
          x.should.equal(5);
          callback(undefined, context);
        }))({}, {write:_.constant(), end:_.constant()});
  });

});
