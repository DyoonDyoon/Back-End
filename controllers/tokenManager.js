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

	// 토큰 생성하기
var generateToken = function(uid, callback) {
	connectionPool.getConnection( // DB에 접근
		function (err, connection) {
			if (err) return callback({ 'message' : err.message }, null); // 에러 메시지 반환
			var deleteSql = 'DELETE FROM access_token WHERE uid = ?';
			connection.query(deleteSql, [uid], function (err, results) {
				if (err) throw err;

				var accessToken = {
					'uid' : uid // 유저 아이디
				};
				var now         = moment().format('YYYY-MM-DD HH:mm:ss'); // 현재시간
				var expiredAt   = moment().add(30, 'm').format('YYYY-MM-DD HH:mm:ss'); // 만료시간 (30분 후)
				// new
				var insertSql    = 'INSERT INTO access_token(id, token, uid, expiredAt, createdAt, updatedAt) '
					+ 'VALUES(NULL, ?, ?, ?, ?, NULL)'; // 토큰 생성을 위한 쿼리문
				var token        = hat(); // 토큰 난수 해시 생성
				var insertParams = [ token, uid, expiredAt, now ];
				connection.query(insertSql, insertParams, function (err, results) {
					if (err) throw err;
					// 토큰 생성 성공
					accessToken.token     = token;
					accessToken.createdAt = now;
					accessToken.expiredAt = expiredAt;
					connection.release();
					callback(null, accessToken); // 생성된 토큰 반환
				});
			});
		});
};

// 토큰 만료시간 갱신
var update = function(token, callback) {
	connectionPool.getConnection(
		function (err, connection) {
			if (err) {
				connection.release();
				return callback({ 'message' : err.message }, null);
			}
			var accessToken = { "token" : token }; // 갱신할 토큰

			var now = moment().format('YYYY-MM-DD HH:mm:ss');
			var expiredAt = moment().add(30, 'm').format('YYYY-MM-DD HH:mm:ss'); // 현재시간으로 30분 후로 만료시간 갱신
			var updateSql         = 'UPDATE access_token SET expiredAt = ?, updatedAt = ? WHERE token = ?'; // 토큰 갱신을 위한 쿼리문
			var updateParams      = [ expiredAt, now, token];
			connection.query(updateSql, updateParams, function (err, results) { // 만료시간 갱신
				if (err) throw err;
				accessToken.updatedAt = now;
				accessToken.expiredAt = expiredAt;
				connection.release();
				callback(null, accessToken);  // 갱신된 토큰 반환
			});
		});
};

// 토큰이 만료되었는 지 확인
var isExpired = function(token, callback) {
	var status = {
		'expired' : false, // 만료되었는지
		'invalidToken' : false // 유효하지 않은 토큰인지
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
						status.expired = true;   // 만료된 토큰
						return callback(null, status);
					} else {
						connection.release();
						return callback(null, status);
					}
				} else {
					status.invalidToken = true; // 유효하지 않은 토큰
					connection.release();
					return callback(null, status);
				}
			});
		}
	);
};

// 존재하는 토큰인지 확인
var existsToken = function(token, callback) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) throw err;
			var selectSql = 'SELECT * FROM access_token WHERE token = ?';
			connection.query(selectSql, [token], function(err, results) {
				if (err) throw err;
				connection.release();
				if (results.length !== 0) {
					return callback(null, true); // 존재하는 토큰
				} else {
					return callback(null, false); // 존재하지 않는 토큰
				}
			});
		}
	);
};

// 3번의 검사 과정을 한번에 하기위한 원패스 체킹 함수
exports.onePassCheck = function(token, callback) {
	if (!token) { // 토큰이 없을 경우 유효하지 않은 접근
		return callback(403,{
			"code" : 5,
			"message" : "Invalid Access"
		});
	}

	existsToken(token, function(err, exists) {  // 토큰이 있는 지 검사
		if (err || !exists)
			return callback(210,{ // 토큰이 없으면 유효하지 않은 토큰
				'code' : 4,
				'message' : 'Invalid Token'
			});
		isExpired(token, function (err, status) { // 만료시간이 지났는지 확인
			if (err)
				return callback(210,err);

			if (status.invalidToken)
				return callback(210,{ // 유효하지 않은 토큰
					'code'    : 4,
					'message' : 'Invalid Token'
				});
			if (status.expired)
				return callback(210, {  // 만료된 토큰
					'code'    : 3,
					'message' : 'session expired'
				});
			update(token, function(err, accessToken) { // 모든 체킹이 끝난 토큰 만료시간 갱신
				if (err)
					return callback(210, err);
				return callback(200, accessToken);  // 갱신된 토큰 반환
			});
		});
	});
};

exports.generateToken = generateToken;
exports.update = update;
exports.isExpired = isExpired;
exports.existsToken = existsToken;