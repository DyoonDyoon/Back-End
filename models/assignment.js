/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('../controllers/tokenManager');
var versionManager = require('../controllers/versionManager');

/*******************************
 * assign Table structure
 *
 * id - INT :  (PRIMARY)
 * assignId - INT :
 * lectureId - VARCHAR(30) :
 * title - TEXT :
 * description - TEXT :
 * filePath - TEXT :
 * startDate - TIMESTAMP :
 * endDate - TIMESTAMP :
 * type - INT :
 * targetId - INT :
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * title :
	 * description :
	 * filPath : 보류
	 * startDate :
	 * endDate :
	 *******************************/
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
				'message' : 'Invalid Token'
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
				if (!req.query['title']) {
					response['message'] = 'no title';
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
						versionManager.list(param['lectureId'], function(err, results) {
							if (err) {
								connection.release();
								response['message'] = err.message;
								return res.status(500).json(response);
							}
							response['assignVer'] = results[0]['assignVer']+1;
							param['type'] = 0;
							param['assignId'] = results[0]['assignVer']+1;
							versionManager.setVersion(param['lectureId'], {'assignVer' : param['assignId']}, function() {
								if (err) {
									connection.release();
									response['message'] = err.message;
									return res.status(500).json(response);
								}
								var insertQuery = 'INSERT INTO assignment SET ?';
								var insertParam = [param];
								connection.query(insertQuery, insertParam, function(err, results) {
									if (err) {
										connection.release();
										response['message'] = err.message;
										return res.status(500).json(response);
									}
									connection.release();
									response["message"] = "Success for post assignment";
									return res.status(200).json(response);
								});
							});
						});
					}
				);
			});
		});
	});
};

exports.get = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * version :
	 *******************************/
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
				'message' : 'Invalid Token'
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
				if (!req.query['lectureId']) {
					response['message'] = 'no lectureId';
					return res.status(210).json(response);
				}
				if (!req.query['version']) {
					response['message'] = 'no version';
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
						versionManager.list(req.query['lectureId'], function(err, results) {
							if (err) {
								connection.release();
								response[ 'message' ] = err.message;
								return res.status(500).json(response);
							}
							response['assignVer'] = results[0]['assignVer'];
							var insertQuery = 'SELECT * FROM assignment WHERE assignId > ? && lectureId = ?';
							var insertParam = [ req.query[ 'version' ], req.query[ 'lectureId' ] ];
							connection.query(insertQuery, insertParam, function (err, results) {
								if (err) {
									connection.release();
									response[ 'message' ] = err.message;
									return res.status(500).json(response);
								}
								connection.release();
								response[ "content" ] = results;
								return res.status(200).json(response);
							});
						});
					}
				);
			});
		});
	});
};

exports.update = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * assignId :
	 * title :
	 * description :
	 * filePath :
	 * startDate :
	 * endDate :
	 *******************************/
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
				'message' : 'Invalid Token'
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
				if (!req.query['title']) {
					response['message'] = 'no title';
					return res.status(210).json(response);
				}
				connectionPool.getConnection(
					function(err, connection) {
						if (err) {
							connection.release();
							response['message'] = err.message;
							return res.status(500).json(response);
						}
						var selectQuery = 'SELECT * FROM assignment WHERE lectureId = ? && assignId = ? && type = 0';
						var selectParams = [req.query['lectureId'], req.query['assignId']];
						connection.query(selectQuery, selectParams, function(err, results) {
							if (err) {
								connection.release();
								response['message'] = err.message;
								return res.status(500).json(response);
							}
							if (results.length == 0) {
								connection.release();
								response['message'] = 'no created assignment';
								return res.status(210).json(response);
							}
							versionManager.list(req.query[ 'lectureId' ], function (err, results) {
								if (err) {
									connection.release();
									response[ 'message' ] = err.message;
									return res.status(500).json(response);
								}
								response[ 'assignVer' ] = results[ 0 ][ 'assignVer' ] + 1;
								var param             = req.query;
								delete param[ 'token' ];  // delete token
								param[ 'type' ] = 1;  // update
								param[ 'targetId' ] = req.query[ 'assignId' ];
								param[ 'assignId' ]   = results[ 0 ][ 'assignVer' ] + 1;
								versionManager.setVersion(req.query[ 'lectureId' ], { 'assignVer' : param[ 'assignId' ] }, function () {
									if (err) {
										connection.release();
										response[ 'message' ] = err.message;
										return res.status(500).json(response);
									}
									var insertQuery = 'INSERT INTO assignment SET ?';
									var insertParam = [ param ];
									connection.query(insertQuery, insertParam, function (err, results) {
										if (err) {
											connection.release();
											response[ 'message' ] = err.message;
											return res.status(500).json(response);
										}
										connection.release();
										response[ "message" ] = "Success for update assignment";
										return res.status(200).json(response);
									});
								});
							});
						});
					}
				);
			});
		});
	});
};

exports.delete = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * assignId :
	 *******************************/
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
				'message' : 'Invalid Token'
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
				if (!req.query['assignId']) {
					response['message'] = 'no assignment id';
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
							response['message'] = err.message;
							res.status(500).json(response);
							return;
						}
						var selectQuery = 'SELECT * FROM assignment WHERE lectureId = ? && targetId = ? && type = 2';
						var selectParams = [req.query['lectureId'], req.query['assignId']];
						connection.query(selectQuery, selectParams, function(err, results) {
							if (err) {
								connection.release();
								response['message'] = err.message;
								return res.status(500).json(response);
							}
							if (results.length != 0) {
								connection.release();
								response['message'] = 'already deleted';
								return res.status(210).json(response);
							}
							selectQuery = 'SELECT * FROM assignment WHERE lectureId = ? && assignId = ? && type = 0';
							connection.query(selectQuery, selectParams, function(err, results) {
								if (err) {
									connection.release();
									response['message'] = err.message;
									return res.status(500).json(response);
								}
								if (results.length == 0) {
									connection.release();
									response['message'] = 'no created assignment';
									return res.status(210).json(response);
								}
								versionManager.list(req.query['lectureId'], function(err, results) {
									if (err) {
										connection.release();
										response['message'] = err.message;
										return res.status(500).json(response);
									}
									response['assignVer'] = results[0]['assignVer']+1;
									var param = {};
									param['type'] = 2;  // delete
									param['lectureId'] = req.query['lectureId'];
									param['targetId'] = req.query['assignId'];
									param['assignId'] = results[0]['assignVer']+1;
									versionManager.setVersion(req.query['lectureId'], {'assignVer' : param['assignId']}, function() {
										if (err) {
											connection.release();
											response['message'] = err.message;
											return res.status(500).json(response);
										}
										var insertQuery = 'INSERT INTO assignment SET ?';
										var insertParam = [param];
										connection.query(insertQuery, insertParam, function(err, results) {
											if (err) {
												connection.release();
												response['message'] = err.message;
												return res.status(500).json(response);
											}
											connection.release();
											response["message"] = "Success for delete assignment";
											return res.status(200).json(response);
										});
									});
								});
							});
						});
					}
				);
			});
		});
	});
};