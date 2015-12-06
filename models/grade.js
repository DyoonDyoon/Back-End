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
 * gradeId - INT :  (PRIMARY)
 * submitId - INT :
 * lectureId - VARCHAR(30) :
 * stuId - VARCHAR(30) :
 * score - INT :
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * submitId :
	 * stuId :
	 * score :
	 *******************************/
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		if (!req.query['lectureId']) {
			response['message'] = 'no lecture id';
			return res.status(210).json(response);
		}
		if (!req.query['submitId']) {
			response['message'] = 'no submit id';
			return res.status(210).json(response);
		}
		if (!req.query['stuId']) {
			response['message'] = 'no student id';
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

				var insertQuery = 'INSERT INTO grade SET ?';
				var insertParam = [param];
				connection.query(insertQuery, insertParam, function(err, results) {
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
	 * stuId :
	 * lectureId :
	 *******************************/
	var token = req.query['token'];

	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		var key = {};
		if (!req.query['lectureId'] && !req.query['stuId']) {
			response[ 'message' ] = 'no lecture id & no student id';
			return res.status(210).json(response);
		}

		if (req.query['stuId']) {
			key['stuId'] = req.query['stuId'];
		}
		if (req.query['lectureId']) {
			key['lectureId'] = req.query['lectureId'];
		}

		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					res.status(500).json(response);
					return;
				}
				var selectQuery = 'SELECT * FROM grade WHERE ?';
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
	 * gradeId :  (PRIMARY)
	 * score :
	 *******************************/
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : accessToken };
		if (!req.query['gradeId']) {
			response['message'] = 'no grade id';
			return res.status(210).json(response);
		}
		if (!req.query['score']) {
			response['message'] = 'no score';
			return res.status(210).json(response);
		}
		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					return res.status(500).json(response);
				}
				var updateQuery = 'UPDATE grade SET score = ? WHERE gradeId = ?';
				var updateParam = [req.query['score'], req.query['gradeId']];
				connection.query(updateQuery, updateParam, function(err, results) {
					connection.release();
					if (err) {
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					response['message'] = 'Success for update grade!';
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
	 * gradeId :
	 *******************************/
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : accessToken };
		if (!req.query['gradeId']) {
			response['message'] = 'no grade id';
			return res.status(210).json(response);
		}
		connectionPool.getConnection(
			function(err, connection) {
				if (err) {
					connection.release();
					response['message'] = err.message;
					return res.status(500).json(response);
				}
				var deleteQuery = 'DELETE FROM grade WHERE gradeId = ?';
				var deleteParam = [req.query['gradeId']];
				connection.query(deleteQuery, deleteParam, function(err, results) {
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