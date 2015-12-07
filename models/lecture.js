/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('./../controllers/tokenManager');
var versionManager = require('../controllers/versionManager');

exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * userId :
	 *******************************/
	var token = req.query['token'];
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

				var insertFunction = function() {
					var insertQuery = 'INSERT INTO lecture(lectureId, userId) VALUES(?, ?)';
					var insertParam = [req.query['lectureId'], req.query['userId']];
					connection.query(insertQuery, insertParam, function(err, results) {
						if (err) {
							connection.release();
							response["message"] = "CANNOT post Lecture";
							console.log(err.message);
							return res.status(500).json(response);
						}
						connection.release();
						response["message"] = "Success for post Lecture";
						res.status(200).json(response);
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
						versionManager.create(req.query['lectureId'], function(err, didSucceed) {
							if (err) {
								connection.release();
								return res.status(500).json(err);
							}
							insertFunction();
						});
					} else {
						insertFunction();
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
	 * lectureId :
	 * userId :
	 *******************************/
	var token = req.query['token'];
	if (!req.query['userId'] || !req.query['lectureId'])
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'user id\' or \'lecture id\''
		});

	tokenManager.onePassCheck(token, function(code, result) {
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
				connection.query(deleteQuery, deleteParam, function(err, results) {
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
	 * userId :
	 *******************************/
	var token = req.query['token'];
	if (!req.query['userId'])
		return res.status(210).json({
			'code' : 10,
			'message' : 'no user id'
		});
	tokenManager.onePassCheck(token, function(code, result) {
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
				connection.query(selectQuery, selectParam, function(err, results) {
					if (err) {
						connection.release();
						response["message"] = "CANNOT get Lecture";
						res.status(500).json(response);
						return;
					}
					connection.release();
					response["content"] = results;
					res.status(200).json(response);
				});
			}
		);
	});
};