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
 * answerId - INT :  (PRIMARY)
 * questionId - VARCHAR(30) :
 * content - TEXT :
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * questionId :
	 * content :
	 *******************************/
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		if (!req.query['question id']) {
			response['message'] = 'no question id';
			return res.status(210).json(response);
		}
		if (!req.query['content']) {
			response['message'] = 'no content';
			return res.status(210).json(response);
		}

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
	 * questionId :
	 *******************************/
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : accessToken };
		if (!req.query['questionId']) {
			response[ 'message' ] = 'no question id';
			return res.status(210).json(response);
		}

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
				connection.query(selectQuery, selectParam, function (err, results) {
					if (err) {
						connection.release();
						response[ 'message' ] = err.message;
						return res.status(500).json(response);
					}
					connection.release();
					if(results.length == 0) {
						response[ "content" ] = 'No answer';
					} else {
						response[ "content" ] = results[ 0 ];
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
	 * answerId :  (PRIMARY)
	 * content :
	 *******************************/
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : accessToken };
		if (!req.query['answerId']) {
			response['message'] = 'no answerId';
			return res.status(210).json(response);
		}
		if (!req.query['content']) {
			response['message'] = 'no content';
			return res.status(210).json(response);
		}

		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					return res.status(500).json(response);
				}
				var updateQuery = 'UPDATE answer SET content = ? WHERE answerId = ?';
				var updateParam = [req.query['content'], req.query['answerId']];
				connection.query(updateQuery, updateParam, function(err, results) {
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
	 * answerId :
	 *******************************/
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : accessToken };
		if (!req.query['answerId']) {
			response['message'] = 'no answer id';
			return res.status(210).json(response);
		}

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