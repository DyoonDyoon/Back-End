/**
 * Created by kweonminjun on 2015. 11. 27..
 */

var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var hat = require('hat');
var moment = require('moment');

/*******************************
 * access_token Table structure
 *
 * id - INT : token's unique identifier (PRIMARY)
 * token - VARCHAR(30) : user's accessToken
 * uid - INT : user's unique identifier
 * expiredAt - TIMESTAMP : token's limit time
 * createdAt - TIMESTAMP : when this token created
 * updatedAt - TIMESTAMP : when this token updated
 *******************************/
var generateToken = function(uid, callback) {
	connectionPool.getConnection(
		function (err, connection) {
			if (err) return callback({ 'message' : err.message }, null);
			var deleteSql = 'DELETE FROM access_token WHERE uid = ?';
			connection.query(deleteSql, [uid], function (err, results) {
				if (err) throw err;

				var accessToken = {
					'uid' : uid
				};
				var now         = moment().format('YYYY-MM-DD HH:mm:ss');
				var expiredAt   = moment().add(30, 'm').format('YYYY-MM-DD HH:mm:ss');
				// new
				var insertSql    = 'INSERT INTO access_token(id, token, uid, expiredAt, createdAt, updatedAt) '
					+ 'VALUES(NULL, ?, ?, ?, ?, NULL)';
				var token        = hat();
				var insertParams = [ token, uid, expiredAt, now ];
				connection.query(insertSql, insertParams, function (err, results) {
					if (err) throw err;
					accessToken.token     = token;
					accessToken.createdAt = now;
					accessToken.expiredAt = expiredAt;
					connection.release();
					callback(null, accessToken);
				});
			});
		});
};

var update = function(token, callback) {
	connectionPool.getConnection(
		function (err, connection) {
			if (err) {
				connection.release();
				return callback({ 'message' : err.message }, null);
			}
			var accessToken = { "token" : token };

			var now = moment().format('YYYY-MM-DD HH:mm:ss');
			var expiredAt = moment().add(30, 'm').format('YYYY-MM-DD HH:mm:ss');
			var updateSql         = 'UPDATE access_token SET expiredAt = ?, updatedAt = ? WHERE token = ?';
			var updateParams      = [ expiredAt, now, token];
			connection.query(updateSql, updateParams, function (err, results) {
				if (err) throw err;
				accessToken.updatedAt = now;
				accessToken.expiredAt = expiredAt;
				connection.release();
				callback(null, accessToken);
			});
		});
};

var isExpired = function(token, callback) {
	var status = {
		'expired' : false,
		'invalidToken' : false
	};

	connectionPool.getConnection(
		function (err, connection) {
			if (err) {
				connection.release();
				return callback({ 'message' : err.message }, false);
			}
			var selectSql = 'SELECT * FROM access_token WHERE token = ?';
			connection.query(selectSql, [token], function (err, rows, fields) {
				if (err) throw err;
				if (rows.length !== 0) {
					if (moment(rows[0].expiredAt).isBefore(moment())) {
						status.expired = true;
						return callback(null, status);
					} else {
						connection.release();
						return callback(null, status);
					}
				} else {
					status.invalidToken = true;
					connection.release();
					return callback(null, status);
				}
			});
		}
	);
};

var existsToken = function(token, callback) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) throw err;
			var selectSql = 'SELECT * FROM access_token WHERE token = ?';
			connection.query(selectSql, [token], function(err, results) {
				if (err) throw err;
				connection.release();
				if (results.length !== 0) {
					return callback(null, true);
				} else {
					return callback(null, false);
				}
			});
		}
	);
};

exports.onePassCheck = function(token, callback) {
	if (!token) {
		return callback(403,{
			"code" : 5,
			"message" : "Invalid Access"
		});
	}

	existsToken(token, function(err, exists) {
		if (err || !exists)
			return callback(210,{
				'code' : 4,
				'message' : 'Invalid Token'
			});
		isExpired(token, function (err, status) {
			if (err)
				return callback(210,err);

			if (status.invalidToken)
				return callback(210,{
					'code'    : 4,
					'message' : 'Invalid Token'
				});
			if (status.expired)
				return callback(210, {
					'code'    : 3,
					'message' : 'session expired'
				});
			update(token, function(err, accessToken) {
				if (err)
					return callback(210, err);
				return callback(200, accessToken);
			});
		});
	});
};

exports.generateToken = generateToken;
exports.update = update;
exports.isExpired = isExpired;
exports.existsToken = existsToken;