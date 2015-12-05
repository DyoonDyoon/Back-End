/**
 * Created by kweonminjun on 2015. 12. 6..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('../controllers/tokenManager');
var versionManager = require('../controllers/versionManager');

/*******************************
 * notification Table structure
 *
 * id - INT :  (PRIMARY)
 * notiId - INT :
 * lectureId - VARCHAR(30) :
 * title - TEXT :
 * description - TEXT :
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
							response['notiVer'] = results[0]['notiVer']+1;
							param['type'] = 0;
							param['notiId'] = results[0]['notiVer']+1;
							versionManager.setVersion(param['lectureId'], {'notiVer' : param['notiId']}, function() {
								if (err) {
									connection.release();
									response['message'] = err.message;
									return res.status(500).json(response);
								}
								var insertQuery = 'INSERT INTO notification SET ?';
								var insertParam = [param];
								connection.query(insertQuery, insertParam, function(err, results) {
									if (err) {
										connection.release();
										response['message'] = err.message;
										return res.status(500).json(response);
									}
									connection.release();
									response["message"] = "Success for post notification";
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
							response['notiVer'] = results[0]['notiVer'];
							var insertQuery = 'SELECT * FROM notification WHERE notiId > ? && lectureId = ?';
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
	 * notiId :
	 * title :
	 * description :
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
						var selectQuery = 'SELECT * FROM notification WHERE lectureId = ? && notiId = ? && type = 0';
						var selectParams = [req.query['lectureId'], req.query['notiId']];
						connection.query(selectQuery, selectParams, function(err, results) {
							if (err) {
								connection.release();
								response['message'] = err.message;
								return res.status(500).json(response);
							}
							if (results.length == 0) {
								connection.release();
								response['message'] = 'no created notification';
								return res.status(210).json(response);
							}
							versionManager.list(req.query[ 'lectureId' ], function (err, results) {
								if (err) {
									connection.release();
									response[ 'message' ] = err.message;
									return res.status(500).json(response);
								}
								response[ 'notiVer' ] = results[ 0 ][ 'notiVer' ] + 1;
								var param             = req.query;
								delete param[ 'token' ];  // delete token
								param[ 'type' ] = 1;  // update
								param[ 'targetId' ] = req.query[ 'notiId' ];
								param[ 'notiId' ]   = results[ 0 ][ 'notiVer' ] + 1;
								versionManager.setVersion(req.query[ 'lectureId' ], { 'notiVer' : param[ 'notiId' ] }, function () {
									if (err) {
										connection.release();
										response[ 'message' ] = err.message;
										return res.status(500).json(response);
									}
									var insertQuery = 'INSERT INTO notification SET ?';
									var insertParam = [ param ];
									connection.query(insertQuery, insertParam, function (err, results) {
										if (err) {
											connection.release();
											response[ 'message' ] = err.message;
											return res.status(500).json(response);
										}
										connection.release();
										response[ "message" ] = "Success for update notification";
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
	 * notiId :
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
				if (!req.query['notiId']) {
					response['message'] = 'no notification id';
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
						var selectQuery = 'SELECT * FROM notification WHERE lectureId = ? && targetId = ? && type = 2';
						var selectParams = [req.query['lectureId'], req.query['notiId']];
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
							selectQuery = 'SELECT * FROM notification WHERE lectureId = ? && notiId = ? && type = 0';
							connection.query(selectQuery, selectParams, function(err, results) {
								if (err) {
									connection.release();
									response['message'] = err.message;
									return res.status(500).json(response);
								}
								if (results.length == 0) {
									connection.release();
									response['message'] = 'no created notification';
									return res.status(210).json(response);
								}
								versionManager.list(req.query['lectureId'], function(err, results) {
									if (err) {
										connection.release();
										response['message'] = err.message;
										return res.status(500).json(response);
									}
									response['notiVer'] = results[0]['notiVer']+1;
									var param = {};
									param['type'] = 2;  // delete
									param['lectureId'] = req.query['lectureId'];
									param['targetId'] = req.query['notiId'];
									param['notiId'] = results[0]['notiVer']+1;
									versionManager.setVersion(req.query['lectureId'], {'notiVer' : param['notiId']}, function() {
										if (err) {
											connection.release();
											response['message'] = err.message;
											return res.status(500).json(response);
										}
										var insertQuery = 'INSERT INTO notification SET ?';
										var insertParam = [param];
										connection.query(insertQuery, insertParam, function(err, results) {
											if (err) {
												connection.release();
												response['message'] = err.message;
												return res.status(500).json(response);
											}
											connection.release();
											response["message"] = "Success for delete notification";
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