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
						var selectParams = [req.query['lecture_id']];
						connection.query(selectQuery, selectParams, function(err, results) {
							if (err) {
								connection.release();
								return res.status(500).json(err);
							}

							var insertFunction = function() {
								var insertQuery = 'INSERT INTO lecture(lectureId, userId) VALUES(?, ?)';
								var insertParam = [req.query['lecture_id'], req.query['user_id']];
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
								versionManager.create(req.query['lecture_id'], function(err, didSucceed) {
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
						var selectParam = [req.query['user_id']];
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