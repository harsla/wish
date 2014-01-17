"use strict";
var constants = require("./constants"),
  wish_mysql = module.exports,
  mysql = require("mysql");

wish_mysql.configure = function (databaseName, connectionString) {
  var pool = mysql.createPool(connectionString);
  return {
    name: databaseName,
    connect: function (callback) {
      return pool.getConnection(function (err, connection) {
        if (err) { callback(err, undefined); return; }
        connection.close = function () {
          connection.release();
        };
        connection.sql = function () {
          connection.query.apply(connection, arguments);
        };
        callback(undefined, connection);
      });
    }
  };
};