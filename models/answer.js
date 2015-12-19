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
 * answerId - INT (PRIMARY)
 * questionId - VARCHAR(30)
 * content - TEXT
 *******************************/
// 답변 달기
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * questionId
	 * content
	 *******************************/
	// 파라미터가 유효하지 않음
	if (!req.query['questionId'] || !req.query['content']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'question id\' or \'content\''
		});
	}

	var token = req.query['token']; // 액세스 토큰
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

				var insertQuery = 'INSERT INTO answer SET ?';
				var insertParam = [param];
				connection.query(insertQuery, insertParam, function(err, results) {
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response["message"] = "Success for post answer";
					return res.status(200).json(response); // 성공적으로 답변 달기 성공
				});
			}
		);
	});
};

// 답변 가져오기
exports.get = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * questionId : 가져올 답변이 달린 질문 아이디
	 *******************************/
	// 파라미터 유효성 검사
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
					res.status(500).json(response);
					return;
				}
				var selectQuery = 'SELECT * FROM answer WHERE questionId = ?';
				var selectParam = [req.query['questionId']];
				connection.query(selectQuery, selectParam, function (err, results) {  // 질문 아이디로 답변 검색
					if (err) {
						connection.release();
						response[ 'message' ] = err.message;
						return res.status(500).json(response);
					}
					connection.release();
					if(results.length == 0) { // 답변이 없을 경우 No answer
						response[ "content" ] = 'No answer';
					} else {
						response[ "content" ] = results[ 0 ]; // 있을 경우 답변 반환
					}
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
	 * answerId : 변경할 답변 아이디 (PRIMARY)
	 * content : 변경할 내용
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['answerId'] || !req.query['content']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'answer id\' or \'content\''
		});
	}

	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 및 갱신
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
				var updateQuery = 'UPDATE answer SET content = ? WHERE answerId = ?';
				var updateParam = [req.query['content'], req.query['answerId']];
				connection.query(updateQuery, updateParam, function(err, results) { // 내용 변경
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for update answer!';
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
	 * answerId : 삭제할 답변 아이디
	 *******************************/
	if (!req.query['answerId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no answer id'
		});
	}

	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
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
				var deleteQuery = 'DELETE FROM answer WHERE answerId = ?';
				var deleteParam = [req.query['answerId']];
				connection.query(deleteQuery, deleteParam, function(err, results) {
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for delete answer!';
					return res.json(response);
				});
			}
		);
	});
};