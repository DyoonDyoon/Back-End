/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var async = require('async');

exports.list = function(lectureKey, callback) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) return callback(err, null);

			var selectQuery = 'SELECT * FROM version WHERE lectureId = ?';
			var selectParams = [lectureKey];
			connection.query(selectQuery, selectParams, function(err, results) {
				connection.release();
				if (err) return callback(err, null);[]
				return callback(null, results);
			});
		}
	);
};

exports.create = function(lectureKey, callback) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) return callback(err, null);

			var insertQuery = 'INSERT INTO version(lectureId) VALUES(?)';
			var insertParams = [lectureKey];
			connection.query(insertQuery, insertParams, function(err, results) {
				connection.release();
				if (err) return callback(err, false);
				return callback(null, true);
			})
		}
	);
};

exports.setVersion = function(lectureKey, values, callback) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) return callback(err, false);

			var updateQuery = 'UPDATE version SET ? WHERE lectureId = ?';
			var updateParams = [values, lectureKey];
			connection.query(updateQuery, updateParams, function(err, results) {
				connection.release();
				if (err) return callback(err, false);
				return callback(err, true);
			})
		}
	);
};

exports.get = function(req, res, next) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) {
				return res.status(500).json({ 'message' : err.message });
			}
			async.waterfall([
					function(callback) {
						var selectQuery = '';
						var selectParam = [];
						connection.query(selectQuery, selectParam, function(err, results) {
							if (err) return callback(err);
							return callback(null, results);
						});
					}
				],
				function (err, results) {

				}
			);
		});
};