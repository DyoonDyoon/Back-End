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
	if (!req.query['lectureId'] || !req.query['title']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'title\' or \'lecture id\''
		});
	}

	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		var param = req.query;
		delete param['token'];
		versionManager.list(param['lectureId'], function(err, results) {
			if (err) {
				response['message'] = err.message;
				return res.status(500).json(response);
			}
			response['notiVer'] = results[0]['notiVer']+1;
			param['type'] = 0;
			param['notiId'] = results[0]['notiVer']+1;
			versionManager.setVersion(param['lectureId'], {'notiVer' : param['notiId']}, function() {
				if (err) {
					response['message'] = err.message;
					return res.status(500).json(response);
				}
				connectionPool.getConnection(
					function(err, connection) {
						if (err) {
							connection.release();
							response['message'] = err.message;
							res.status(500).json(response);
							return;
						}
						var insertQuery = 'INSERT INTO notification SET ?';
						var insertParam = [param];
						connection.query(insertQuery, insertParam, function(err, results) {
							connection.release();
							if (err) {
								response['message'] = err.message;
								return res.status(500).json(response);
							}
							response["message"] = "Success for post notification";
							return res.status(200).json(response);
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
	if (!req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no lecture id'
		});
	}
	if (!req.query['version']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no version'
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
				versionManager.list(req.query['lectureId'], function(err, results) {
					if (err) {
						connection.release();
						response[ 'message' ] = err.message;
						return res.status(500).json(response);
					}
					response['notiVer'] = results[0]['notiVer'];
					var selectQuery = 'SELECT * FROM notification WHERE notiId > ? && lectureId = ?';
					var selectParam = [ req.query[ 'version' ], req.query[ 'lectureId' ] ];
					connection.query(selectQuery, selectParam, function (err, results) {
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
	if (!req.query['lectureId'] || !req.query['notiId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' or \'notification id\''
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
};

exports.delete = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId :
	 * notiId :
	 *******************************/
	if (!req.query['lectureId'] || !req.query['notiId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'lecture id\' or \'notification id\''
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
};