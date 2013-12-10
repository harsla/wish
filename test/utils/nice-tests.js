"use strict";
var LOCALHOST = "localhost",
  TEST_PORT = 10080;

var _ = require("underscore"),
  should = require("should"),
  httpClient = require("./http-client.js"),
  wish = require("../../lib/wish.js"),
  nice_tests = module.exports;

nice_tests.createAndTestService = function (serviceConfigurator, testData) {
  return function (done) {
    var server, app = wish.generateApp();
    serviceConfigurator(app);
    server = app.listen(TEST_PORT, function () {
      httpClient.request(testData.request.method, LOCALHOST, TEST_PORT, testData.request.path, testData.request.headers,
        testData.request.body, function (response) {
          _.each(response, function (value, key, list) {
            if (!testData.response[key]) { return; }
            if ("payload" === key && _.isObject(testData.response[key]) && _.isString(response[key])) {
              should(JSON.parse(response[key])).eql(testData.response[key]);
              //_.isEqual(JSON.parse(response[key]), testData.response[key]).should.equal(true);
            } else {
              should.equal(response[key], testData.response[key]);
            }
          });
          server.on("close", function () {
            done();
          });
          server.close();
        });
    });
  };
};