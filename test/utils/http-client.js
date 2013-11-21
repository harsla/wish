"use strict";
var _ = require("underscore"),
  http = require("http"),
  http_client = module.exports;

http_client.request = function (method, host, port, path, callback) {
  var request = http.request({ method: method, hostname: host, port: port, path: path },
    function (response) {
      var friendlyResponse = {
        statusCode: response.statusCode,
        payload: ""
      };
      response.setEncoding("utf8");
      response.on("data", function (data) {
        friendlyResponse.payload += data;
      });
      response.on("end", function () {
        callback(friendlyResponse);
      });
    });

  request.on("error", function (error) {
    console.log("error!!", error);
  });

  request.end();
};


