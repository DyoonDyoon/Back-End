/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('./../controllers/tokenManager');
var versionManager = require('../controllers/versionManager');

// 수강신청
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * userId
	 *******************************/
	var token = req.query['token'];
	// 파라미터 유효성 검사
	if (!req.query['userId'] || !req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'user id\' or \'lecture id\''
		});
	}
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);
		var response = { "accessToken" : result };
		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response["message"] = "CANNOT post Lecture";
					return res.status(500).json(response);
				}

				var insertFunction = function() { // 추가하는 메소드
					var insertQuery = 'INSERT INTO lecture(lectureId, userId) VALUES(?, ?)';
					var insertParam = [req.query['lectureId'], req.query['userId']];
					connection.query(insertQuery, insertParam, function(err, results) { // 수강 신청
						if (err) {
							connection.release();
							response["message"] = "CANNOT post Lecture";
							console.log(err.message);
							return res.status(500).json(response);  // 에러반환
						}
						connection.release();
						response["message"] = "Success for post Lecture";
						res.status(200).json(response); // 결과 반환
					});
				};

				var selectQuery = 'SELECT * FROM version WHERE lectureId = ?';
				var selectParams = [req.query['lectureId']];
				connection.query(selectQuery, selectParams, function(err, results) {
					if (err) {
						connection.release();
						return res.status(500).json(err);
					}

					if (results.length == 0) {
						versionManager.create(req.query['lectureId'], function(err, didSucceed) { // 버전 레코드가 없을 경우 버전레코드 생성
							if (err) {
								connection.release();
								return res.status(500).json(err);
							}
							insertFunction(); // 수강신청
						});
					} else {  // 버전 레코드가 있을 경우 레코드 생성하지 않고
						insertFunction(); // 수강신청
					}
				});
			}
		);
	});
};

exports.delete = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * userId
	 *******************************/
	var token = req.query['token'];
	// 파라미터 유효성 검사
	if (!req.query['userId'] || !req.query['lectureId'])
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'user id\' or \'lecture id\''
		});

	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response["message"] = "CANNOT delete Lecture";
					res.status(500).json(response);
					return;
				}
				var deleteQuery = 'DELETE FROM lecture WHERE userId = ? && lectureId = ?';
				var deleteParam = [req.query['userId'], req.query['lectureId']];
				connection.query(deleteQuery, deleteParam, function(err, results) { // 수강 취소
					connection.release();
					if (err) {
						response["message"] = "CANNOT delete Lecture";
						res.status(500).json(response);
						return;
					}
					response["message"] = "Success to delete lecture";
					res.status(200).json(response);
				});
			}
		);
	});
};

exports.get = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * userId
	 *******************************/
	var token = req.query['token'];
	// 파라미터 유효성 검사
	if (!req.query['userId'])
		return res.status(210).json({
			'code' : 10,
			'message' : 'no user id'
		});
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);
		var response = { "accessToken" : result };
		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response["message"] = "CANNOT get Lecture";
					res.status(500).json(response);
					return;
				}
				var selectQuery = 'SELECT * FROM lecture WHERE userId = ?';
				var selectParam = [req.query['userId']];
				connection.query(selectQuery, selectParam, function(err, results) { // 유저가 듣는 모든 강의 검색
					if (err) {
						connection.release();
						response["message"] = "CANNOT get Lecture";
						res.status(500).json(response);
						return;
					}
					connection.release();
					response["content"] = results;  // 검색 결과 반환
					res.status(200).json(response);
				});
			}
		);
	});
};