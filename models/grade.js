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
		});
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
				var key = {};
				if (!req.query['lectureId'] && !req.query['stuId']) {
					response[ 'message' ] = 'no lecture id & no student id';
					return res.status(210).json(response);
				} else if (!req.query['stuId']) {
					key['lectureId'] = req.query['lectureId'];
				} else {
					key["stuId"] = req.query['stuId'];
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
							if (err) {
								connection.release();
								response[ 'message' ] = err.message;
								return res.status(500).json(response);
							}
							connection.release();
							response[ "content" ] = results;
							return res.status(200).json(response);
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
	 * gradeId :  (PRIMARY)
	 * score :
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
		});
	});
};

exports.delete = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * gradeId :
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
		});
	});
};