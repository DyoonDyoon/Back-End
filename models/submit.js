/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('../controllers/tokenManager');
/*******************************
 * submit Table structure
 *
 * submitId - INT : 레포트 아이디 (PRIMARY)
 * lectureId - VARCHAR(30) : 강의 아이디
 * assignId - INT : 과제 아이디
 * stuId - VARCHAR(30) : 제출자 아이디
 * filePath - VARCHAR(30) : 첨부파일
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * assignId
	 * stuId
	 * filePath
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['lectureId'] || !req.query['assignId'] || !req.query['stuId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' & \'assignment id\' & \'student id\''
		});
	}

	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					res.status(500).json(response);
					return;
				}
				var param = req.query;
				delete param['token'];

				var insertQuery = 'INSERT INTO submit SET ?';
				var insertParam = [param];
				connection.query(insertQuery, insertParam, function(err, results) { // 레포트 업로드ㄴ
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response["message"] = "Success for post submit";
					return res.status(200).json(response);
				});
			}
		);
	});
};

exports.get = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId : 강의 아이디
	 * stuId : 제출자 아이디 (for student)
	 * assignId : 과제 아이디
	 *
	 * choose one option
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\''
		});
	}
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };

		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					res.status(500).json(response);
					return;
				}
				var selectQuery = 'SELECT * FROM submit WHERE lectureId = ?';
				var selectParam = [req.query['lectureId']];
				if (req.query['assignId']) {
					selectQuery = selectQuery + ' && assignId = ?';
					selectParam.push(req.query['assignId']);
				}
				if (req.query['stuId']) {
					selectQuery = selectQuery + ' && stuId = ?';
					selectParam.push(req.query['stuId']);
				}
				connection.query(selectQuery, selectParam, function (err, results) { // 파라미터에 따른 내용 가져오기
					connection.release();
					if (err) {
						response[ 'message' ] = err.message;
						return res.status(500).json(response);
					}
					response[ "content" ] = results;
					return res.status(200).json(response);  // 결과 반환
				});
			}
		);
	});
};

exports.update = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * submitId
	 * filePath
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['filePath'] || !req.query['submitId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'file path\' or \'submit id\''
		});
	}
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };

		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					return res.status(500).json(response);
				}
				var updateQuery = 'UPDATE submit SET filePath = ? WHERE submitId = ?';
				var updateParam = [req.query['filePath'], req.query['submitId']];
				connection.query(updateQuery, updateParam, function(err, results) { // 레포트 내용 변경
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for update submit!';
					return res.json(response);
				});
			}
		);

	});
};

exports.delete = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * submitId
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['submitId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no submit id'
		});
	}
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);
		var response = { "accessToken" : result };
		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					return res.status(500).json(response);
				}
				var deleteQuery = 'DELETE FROM submit WHERE submitId = ?';
				var deleteParam = [req.query['submitId']];
				connection.query(deleteQuery, deleteParam, function(err, results) { // 레포트 삭제
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for delete submit!';
					return res.json(response);
				});
			}
		);
	});
};