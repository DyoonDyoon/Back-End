/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('../controllers/tokenManager');

/*******************************
 * grade Table structure
 *
 * gradeId - INT : 점수 아이디 (PRIMARY)
 * submitId - INT : 레포트 아이디
 * lectureId - VARCHAR(30) : 강의 아이디
 * stuId - VARCHAR(30) : 제출자 아이디
 * score - INT : 점수
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * submitId
	 * stuId
	 * score
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no lecture id'
		});
	}
	if (!req.query['submitId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no submit id'
		});
	}
	if (!req.query['stuId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no student id'
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

				var insertQuery = 'INSERT INTO grade SET ?';
				var insertParam = [param];
				connection.query(insertQuery, insertParam, function(err, results) { // 점수 업로드
					if (err) {
						connection.release();
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					connection.release();
					response["message"] = "Success for post grade";
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
	 * stuId
	 * lectureId
	 *******************************/
	var key = {};
	// 파라미터 유효성 검사
	if (!req.query['lectureId'] && !req.query['stuId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' & \'student id\''
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
				var selectQuery = 'SELECT * FROM grade WHERE ';
				var selectParam = [];
				if (req.query['lectureId']) {
					selectQuery = selectQuery + 'lectureId = ?';
					selectParam.push(req.query['lectureId']);
				}
				if (req.query['stuId']) {
					if (req.query['lectureId'])
						selectQuery = selectQuery + ' && ';
					selectQuery = selectQuery + 'stuId = ?';
					selectParam.push(req.query['stuId']);
				}
				connection.query(selectQuery, selectParam, function (err, results) { // 해당 파라미터에 의한 점수 검색
					connection.release();
					if (err) {
						response[ 'message' ] = err.message;
						return res.status(500).json(response);
					}
					response[ "content" ] = results;  // 검색된 결과 반환
					return res.status(200).json(response);
				});
			}
		);
	});
};

exports.update = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * gradeId
	 * score
	 *******************************/
	// 유효성 검사
	if (!req.query['gradeId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no grade id'
		});
	}
	if (!req.query['score']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no score'
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
				var updateQuery = 'UPDATE grade SET score = ? WHERE gradeId = ?';
				var updateParam = [req.query['score'], req.query['gradeId']];
				connection.query(updateQuery, updateParam, function(err, results) { // 점수 갱신
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for update grade!';
					return res.json(response);  // 결과 반환
				});
			}
		);
	});
};

exports.delete = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * gradeId
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['gradeId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no grade id'
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
				var deleteQuery = 'DELETE FROM grade WHERE gradeId = ?';
				var deleteParam = [req.query['gradeId']];
				connection.query(deleteQuery, deleteParam, function(err, results) { // 점수 삭제
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for delete grade!';
					return res.json(response);
				});
			}
		);
	});
};