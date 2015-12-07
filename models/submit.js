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
 * submitId - INT :  (PRIMARY)
 * lectureId - VARCHAR(30) :
 * assignId - INT :
 * stuId - VARCHAR(30) :
 * filePath - VARCHAR(30) :
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * assignId :
	 * stuId :
	 * filePath :
	 *******************************/
	if (!req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no lecture id'
		});
	}
	if (!req.query['assignId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no assignment id'
		});
	}
	if (!req.query['stuId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no student id'
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

				var insertQuery = 'INSERT INTO submit SET ?';
				var insertParam = [param];
				connection.query(insertQuery, insertParam, function(err, results) {
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
	 * lectureId :
	 * stuId :  for student
	 * assignId :
	 *
	 * choose one option
	 *******************************/
	if (!req.query['lectureId'] || !req.query['assignId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' or \'assignment id\''
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
				var selectQuery = 'SELECT * FROM submit WHERE lectureId = ? && assignId = ?';
				var selectParam = [req.query['lectureId'], req.query['assignId']];
				if (req.query['stuId']) {
					selectQuery = selectQuery + ' && stuId = ?';
					selectParam.push(req.query['stuId']);
				}
				console.log(selectQuery);
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
	 * submitId :  (PRIMARY)
	 * filePath :
	 *******************************/
	if (!req.query['filePath'] || !req.query['submitId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'file path\' or \'submit id\''
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
				var updateQuery = 'UPDATE submit SET filePath = ? WHERE submitId = ?';
				var updateParam = [req.query['filePath'], req.query['submitId']];
				connection.query(updateQuery, updateParam, function(err, results) {
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
	 * submitId :
	 *******************************/
	if (!req.query['submitId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no submit id'
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
				var deleteQuery = 'DELETE FROM submit WHERE submitId = ?';
				var deleteParam = [req.query['submitId']];
				connection.query(deleteQuery, deleteParam, function(err, results) {
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