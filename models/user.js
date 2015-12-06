/**
 * Created by kweonminjun on 2015. 11. 25..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);

exports.list = function (req, res) {
	connectionPool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM user', function (err, rows, fields) {
      if (err) throw err;
	    connection.release();
      return res.json(rows);
    });
  });
};

/*************************************
 * the attributes which could be
 *
 * password - SHA1
 * major -
 * name -
 *************************************/
exports.update = function (req, res, next) {
	connectionPool.getConnection(function (err, connection) {
		var updateSql = 'UPDATE user SET ? WHERE uid = ?';
		var updateParams = [];
		if (req.query['password']) {

		}
		if (req.query['major']) {

		}
		if (req.query['name']) {

		}

		connection.query(updateSql, updateParams, function (err, rows, fields) {

		});
	})
};
