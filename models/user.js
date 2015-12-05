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
}