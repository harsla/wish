"use strict";
var constants = require("./constants"),
  wish_mysql = module.exports,
  mysql = require("mysql");

wish_mysql.configure = function (databaseName, connectionString) {
  var pool = mysql.createPool(connectionString);
  return {
    name: databaseName,
    connect: function (callback) {
      return pool.getConnection(callback);
    }
  };
};