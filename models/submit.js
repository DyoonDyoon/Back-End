/**
 * Created by kweonminjun on 2015. 12. 6..
 */
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
				if (!req.query['assignId']) {
					response['message'] = 'no assignment id';
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

						var insertQuery = 'INSERT INTO submit SET ?';
						var insertParam = [param];
						connection.query(insertQuery, insertParam, function(err, results) {
							if (err) {
								connection.release();
								response['message'] = err.message;
								return res.status(500).json(response);
							}
							connection.release();
							response["message"] = "Success for post submit";
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
	 * assignId :
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
				if (!req.query['assignId'] && !req.query['stuId']) {
					response[ 'message' ] = 'no assginment id & no student id';
					return res.status(210).json(response);
				} else if (!req.query['stuId']) {
					key['assignId'] = req.query['assignId'];
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
						var selectQuery = 'SELECT * FROM submit WHERE ?';
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
	 * submitId :  (PRIMARY)
	 * filePath :
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
	 * submitId :
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
				if (!req.query['submitId']) {
					response['message'] = 'no submit id';
					return res.status(210).json(response);
				}
				connectionPool.getConnection(
					function(err, connection) {
						if (err) {
							connection.release();
							response['message'] = err.message;
							return res.status(500).json(response);
						}
						var deleteQuery = 'DELETE FROM submit WHERE submitId = ?';
						var deleteParam = [req.query['submitID']];
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