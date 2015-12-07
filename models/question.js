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
 * questionId - INT :  (PRIMARY)
 * lectureId - VARCHAR(30) :
 * stuId - VARCHAR(30) :
 * content - TEXT :
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * stuId :
	 * content :
	 *******************************/
	if (!req.query['lectureId'] || !req.query['stuId'] || !req.query['content']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' or \'student id\' or \'content\''
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
					res.status(500).json(response);
					return;
				}
				var param = req.query;
				delete param['token'];

				var insertQuery = 'INSERT INTO question SET ?';
				var insertParam = [param];
				connection.query(insertQuery, insertParam, function(err, results) {
					if (err) {
						connection.release();
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					connection.release();
					response["message"] = "Success for post question";
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
	 * stuId :
	 * lectureId :
	 *
	 * choose one option
	 *******************************/
	var key = {};
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
	tokenManager.onePassCheck(token, function(code, result) {
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
				connection.query(selectQuery, selectParam, function (err, results) {
					connection.release();
					if (err) {
						response[ 'message' ] = err.message;
						return res.status(500).json(response);
					}
					response[ "content" ] = results;
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
	 * questionId :  (PRIMARY)
	 * content :
	 *******************************/
	if (!req.query['questionId'] || !req.query['content']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'question id\' or \'content\''
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
				var updateQuery = 'UPDATE question SET content = ? WHERE questionId = ?';
				var updateParam = [req.query['content'], req.query['questionId']];
				connection.query(updateQuery, updateParam, function(err, results) {
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
				var deleteQuery = 'DELETE FROM question WHERE questionId = ?';
				var deleteParam = [req.query['questionId']];
				connection.query(deleteQuery, deleteParam, function(err, results) {
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