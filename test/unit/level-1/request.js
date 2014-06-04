"use strict";

var _ = require("underscore"),
  niceTests = require("../../utils/nice-tests.js"),
  constants = require("../../../lib/constants.js"),
  wish = require("../../../lib/wish.js");

wish.log.level = constants.LOG_WARN;

suite('request-control-flow', function () {

  var tracker = {
    currentMilestone: 0,
    assertMilestone: function (expectedMilestone) {
      this.currentMilestone += 1;
      this.currentMilestone.should.equal(expectedMilestone);
    },
    milestoneStep: function (expectedMilestone, testDoneCallback) {
      var that = this;
      return function (context, callback) {
        that.assertMilestone(expectedMilestone);
        if (testDoneCallback) {
          testDoneCallback();
        }
        if (callback) {
          callback(undefined, context);
        }
      }
    },
    milestoneResponder: function (expectedMilestone, testDoneCallback) {
      var that = this;
      return function (error, context) {
        that.assertMilestone(expectedMilestone);
        if (testDoneCallback) {
          testDoneCallback();
        }
      }
    },
    installMilestoneErrorHandler: function (expectedMilestone, testDoneCallback) {
      if(wish._generalErrorHandler) {
        assert.fail("some jerk tried to install more than one milestone err handler");
      }
      wish._generalErrorHandler = wish.generalErrorHandler;
      var that = this;
      wish.generalErrorHandler = function (error, context) {
        that.assertMilestone(expectedMilestone);
        if (testDoneCallback) {
          testDoneCallback();
        }
        wish._generalErrorHandler(error, context);
      }
    }
  },
  assertFailure = function () {
    assert.fail("This function should never be called.");
  },
  mockRequest = {},
  mockResponse = {write:_.constant(), end:_.constant()};

  setup(function () {
    tracker.currentMilestone = 0;
    if(wish._generalErrorHandler) {
      wish.generalErrorHandler = wish._generalErrorHandler;
      delete wish._generalErrorHandler;
    }
  });

  test('normal flow', function (done) {
    wish.composeContextualizedRequestHandler(
      tracker.milestoneResponder(4, done),
      tracker.milestoneStep(1),
      tracker.milestoneStep(2),
      tracker.milestoneStep(3))(mockRequest, mockResponse);
  });

  test('faulty flow', function (done) {
    tracker.installMilestoneErrorHandler(4, done);
    wish.composeContextualizedRequestHandler(
      assertFailure,
      tracker.milestoneStep(1),
      tracker.milestoneStep(2),
      function stepThree (context, callback) {
        tracker.assertMilestone(3)
        callback(wish.generateError(500,"boop"), context);
      })(mockRequest, mockResponse);
  });

  test('alternate faulty flow', function (done) {
    tracker.installMilestoneErrorHandler(2, done);
    wish.composeContextualizedRequestHandler(
      assertFailure,
      function stepOne (context, callback) {
        tracker.assertMilestone(1)
        callback(wish.generateError(500,"boop"), context);
      },
      assertFailure,
      assertFailure
    )(mockRequest, mockResponse);
  });

  test('normal flow with finalizers', function (done) {
    wish.composeContextualizedRequestHandler(
      tracker.milestoneResponder(4),
      wish.buildStep(tracker.milestoneStep(1), tracker.milestoneStep(7, done)),
      wish.buildStep(tracker.milestoneStep(2), tracker.milestoneStep(6)),
      wish.buildStep(tracker.milestoneStep(3), tracker.milestoneStep(5))
    )(mockRequest, mockResponse);
  });

  test('faulty flow with finalizers', function (done) {
    tracker.installMilestoneErrorHandler(4, done);
    wish.composeContextualizedRequestHandler(
      assertFailure,
      wish.buildStep(tracker.milestoneStep(1), tracker.milestoneStep(7, done)),
      wish.buildStep(tracker.milestoneStep(2), tracker.milestoneStep(6)),
      wish.buildStep(function stepThree (context, callback) {
          tracker.assertMilestone(3)
          callback(wish.generateError(500,"boop"), context);
        }, tracker.milestoneStep(5))
      )(mockRequest, mockResponse);
  });

});
