"use strict";
var constants = require("./constants"),
  log = module.exports;

log.level = constants.LOG_INFO;

log.log = function (level, message) {
  if (level.value >= this.level.value) {
    var now = new Date(),
      ts = now.getMonth() + "/" + now.getDate() + "/" + now.getFullYear() + " " +
        now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds();
    console.log(ts + " " + level.name + " " + message + "\n");
  }
};

log.error = function (message) {
  this.log(constants.LOG_ERROR, message);
};

log.warn = function (message) {
  this.log(constants.LOG_WARN, message);
};

log.info = function (message) {
  this.log(constants.LOG_INFO, message);
};

log.debug = function (message) {
  this.log(constants.LOG_DEBUG, message);
};