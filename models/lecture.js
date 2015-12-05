/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('./../controllers/tokenManager');

var versionManager = require('../controllers/versionManager');

exports.postLecture = function(req, res, next) {
	var token = req.query['token'];
	if (!token) {
		return res.status(403).json({
			"code" : 5,
			"message" : "Invalid Access"
		});
	}

	tokenManager.existsToken(token, function(err, exists) {
		if (err || !exists)
			return res.status(210).json({
				'code' : 4,
				'message' : 'Invalid token'
			});
		tokenManager.isExpired(token, function (err, status) {
			if (err)
				return res.status(210).json(err);

			if (status.invalidToken)
				return res.status(210).json({
					'code'    : 4,
					'message' : 'Invalid Token'
				});
			if (status.expired)
				return res.status(210).json({
					'code'    : 3,
					'message' : 'session expired'
				});
			tokenManager.update(token, function(err, accessToken) {
				if (err)
					return res.status(210).json(err);
				var response = { "accessToken" : accessToken };
				connectionPool.getConnection(
					function(err, connection) {
						if (err) {
							connection.release();
							response["message"] = "CANNOT post Lecture";
							return res.status(500).json(response);
						}
						var selectQuery = 'SELECT * FROM version WHERE lectureId = ?';
						var selectParams = [req.query['lectureId']];
						connection.query(selectQuery, selectParams, function(err, results) {
							if (err) {
								connection.release();
								return res.status(500).json(err);
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
		});
	});
};

exports.delete = function(req, res, next) {
	var token = req.query['token'];
	if (!token) {
		return res.status(403).json({
			"code" : 5,
			"message" : "Invalid Access"
		});
	}

	tokenManager.existsToken(token, function(err, exists) {
		if (err || !exists)
			return res.status(210).json({
				'code' : 4,
				'message' : 'Invalid token'
			});
		tokenManager.isExpired(token, function (err, status) {
			if (err)
				return res.status(500).json(err);

			if (status.invalidToken)
				return res.status(210).json({
					'code'    : 4,
					'message' : 'Invalid Token'
				});
			if (status.expired)
				return res.status(210).json({
					'code'    : 3,
					'message' : 'session expired'
				});
			tokenManager.update(token, function(err, accessToken) {
				var response = { "accessToken" : accessToken };
				if (!req.query['userId']) {
					response['message'] = 'no user id';
					return res.status(210).json(response);
				}
				if (!req.query['lectureId']) {
					response['message'] = 'no lecture id';
					return res.status(210).json(response);
				}
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
							if (err) {
								connection.release();
								response["message"] = "CANNOT delete Lecture";
								res.status(500).json(response);
								return;
							}
							connection.release();
							response["message"] = "Success to delete lecture : " + req.query['lectureId']
								+ ", id : " + req.query['userId'];
							res.status(200).json(response);
						});
					}
				);
			});
		});
	});
};

exports.getLecture = function(req, res, next) {
	var token = req.query['token'];
	if (!token) {
		return res.status(403).json({
			"code" : 5,
			"message" : "Invalid Access"
		});
	}

	tokenManager.existsToken(token, function(err, exists) {
		if (err || !exists)
			return res.status(210).json({
				'code' : 4,
				'message' : 'Invalid token'
			});
		tokenManager.isExpired(token, function (err, status) {
			if (err)
				return res.status(500).json(err);

			if (status.invalidToken)
				return res.status(210).json({
					'code'    : 4,
					'message' : 'Invalid Token'
				});
			if (status.expired)
				return res.status(210).json({
					'code'    : 3,
					'message' : 'session expired'
				});
			tokenManager.update(token, function(err, accessToken) {
				var response = { "accessToken" : accessToken };
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
		});
	});
};