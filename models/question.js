/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('../controllers/tokenManager');
/*******************************
 * question Table structure
 *
 * questionId - INT : 질문 아이디 (PRIMARY)
 * lectureId - VARCHAR(30) : 강의 아이디
 * stuId - VARCHAR(30) : 질문자 아이디
 * content - TEXT : 질문 내용
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * stuId
	 * content
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['lectureId'] || !req.query['stuId'] || !req.query['content']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' or \'student id\' or \'content\''
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

				var insertQuery = 'INSERT INTO question SET ?';
				var insertParam = [param];
				connection.query(insertQuery, insertParam, function(err, results) { // 질문 추가
					if (err) {
						connection.release();
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					connection.release();
					response["message"] = "Success for post question";
					return res.status(200).json(response);  // 결과 반환
				});
			}
		);
	});
};

exports.get = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * stuId
	 * lectureId
	 *
	 * choose one option
	 *******************************/
	var key = {};

	// 파라미터 유효성 검사
	if (!req.query['lectureId'] && !req.query['stuId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' or \'student id\''
		});
	} else if (!req.query['stuId']) {
		key['lectureId'] = req.query['lectureId'];
	} else {
		key["stuId"] = req.query['stuId'];
	}

	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {   // 토큰 유효성 검사 및 갱신
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
				var selectQuery = 'SELECT * FROM question WHERE ?';
				var selectParam = [key];
				connection.query(selectQuery, selectParam, function (err, results) {  // 파라미터에 따른 검색
					connection.release();
					if (err) {
						response[ 'message' ] = err.message;
						return res.status(500).json(response);
					}
					response[ "content" ] = results;
					return res.status(200).json(response);  // 검색 결과 반환
				});
			}
		);
	});
};

exports.update = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * questionId
	 * content
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['questionId'] || !req.query['content']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'question id\' or \'content\''
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
				var updateQuery = 'UPDATE question SET content = ? WHERE questionId = ?';
				var updateParam = [req.query['content'], req.query['questionId']];
				connection.query(updateQuery, updateParam, function(err, results) { // 질문 내용 변경
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for update question!';
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
	 * questionId :
	 *******************************/
	if (!req.query['questionId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no question id'
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
				var deleteQuery = 'DELETE FROM question WHERE questionId = ?';
				var deleteParam = [req.query['questionId']];
				connection.query(deleteQuery, deleteParam, function(err, results) { // 질문 삭제
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for delete question!';
					return res.json(response);
				});
			}
		);
	});
};