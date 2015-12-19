/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);

// 강의별 버전 확인
exports.list = function(lectureKey, callback) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) return callback(err, null);

			var selectQuery = 'SELECT * FROM version WHERE lectureId = ?';
			var selectParams = [lectureKey];
			connection.query(selectQuery, selectParams, function(err, results) { // 강의 버전 가져오기
				connection.release();
				if (err) return callback(err, null);  // 에러 반환
				return callback(null, results); // 버전 반환
			});
		}
	);
};

exports.create = function(lectureKey, callback) { // 해당 강의에 대한 버전 레코드 생성
	connectionPool.getConnection(
		function(err, connection) {
			if (err) return callback(err);

			var insertQuery = 'INSERT INTO version(lectureId) VALUES(?)';
			var insertParams = [lectureKey];
			connection.query(insertQuery, insertParams, function(err, results) {  // 버전 레코드 생성
				connection.release();
				if (err) return callback(err);
				return callback(null);
			})
		}
	);
};

exports.setVersion = function(lectureKey, values, callback) {
	connectionPool.getConnection(
		function(err, connection) {
			if (err) return callback(err);

			var updateQuery = 'UPDATE version SET ? WHERE lectureId = ?';
			var updateParams = [values, lectureKey];
			connection.query(updateQuery, updateParams, function(err, results) { // 버전 내용 변경
				connection.release();
				if (err) return callback(err);
				return callback(err);
			})
		}
	);
};