"use strict";
var LOCALHOST = "localhost",
  TEST_PORT = 10080;

var _ = require("underscore"),
  should = require("should"),
  httpClient = require("./http-client.js"),
  express = require("express"),
  nice_tests = module.exports;

nice_tests.createAndTestService = function (serviceConfigurator, testData) {
  return function (done) {
    var server, app = express();
    serviceConfigurator(app);
    server = app.listen(TEST_PORT, function () {
      httpClient.request(testData.request.method, LOCALHOST, TEST_PORT, testData.request.path, function (response) {
        _.each(response, function (value, key, list) {
          if (testData.response[key]) {
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