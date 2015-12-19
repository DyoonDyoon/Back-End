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
 * id - INT (PRIMARY)
 * assignId - INT : 과제 아이디
 * lectureId - VARCHAR(30) : 강의 아이디
 * title - TEXT : 과제 제목
 * description - TEXT : 과제 내용
 * filePath - TEXT : 첨부 파일
 * startDate - TIMESTAMP : 과제 시작일
 * endDate - TIMESTAMP : 과제 마감일
 * type - INT : 레코드 추가, 변경, 삭제 타입 설정
 * targetId - INT : 변경이나 삭제할 과제 아이디
 *******************************/
exports.post = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * title
	 * description
	 * filePath
	 * startDate
	 * endDate
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['title'] || !req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'title\' or \'lecture id\''
		});
	}

	var token = req.query[ 'token' ];
	tokenManager.onePassCheck(token, function (code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		versionManager.list(req.query[ 'lectureId' ], function (err, results) {
			if (err) {
				response[ 'message' ] = err.message;
				return res.status(500).json(response);
			}
			var param               = req.query;
			delete param[ 'token' ];
			response[ 'assignVer' ] = results[ 0 ][ 'assignVer' ] + 1;
			param[ 'type' ]         = 0;
			param[ 'assignId' ]     = results[ 0 ][ 'assignVer' ] + 1;
			versionManager.setVersion(param[ 'lectureId' ], { 'assignVer' : param[ 'assignId' ] }, function (err) { // 버전 세팅
				if (err) {
					response[ 'message' ] = err.message;
					return res.status(500).json(response);
				}
				connectionPool.getConnection(
					function (err, connection) {
						if (err) {
							connection.release();
							response[ 'message' ] = err.message;
							res.status(500).json(response);
							return;
						}
						var insertQuery = 'INSERT INTO assignment SET ?';
						var insertParam = [ param ];
						connection.query(insertQuery, insertParam, function (err, results) {  // 과제 추가
							connection.release();
							if (err) {
								response[ 'message' ] = err.message;
								return res.status(500).json(response);
							}
							response[ "message" ] = "Success for post assignment";
							return res.status(200).json(response);
						});
					});
			});
		});
	});
};


exports.get = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * version
	 *******************************/
	// 파라미터 유효성 검사
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
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code != 200)
			return res.status(code).json(result);

		var response = { "accessToken" : result };
		versionManager.list(req.query['lectureId'], function(err, results) {
			if (err) {
				connection.release();
				response[ 'message' ] = err.message;
				return res.status(500).json(response);
			}
			connectionPool.getConnection(
				function(err, connection) {
					if (err) {
						connection.release();
						response[ 'message' ] = err.message;
						res.status(500).json(response);
						return;
					}
					response[ 'assignVer' ] = results[ 0 ][ 'assignVer' ];
					var insertQuery         = 'SELECT * FROM assignment WHERE assignId > ? && lectureId = ?';
					var insertParam         = [ req.query[ 'version' ], req.query[ 'lectureId' ] ];
					connection.query(insertQuery, insertParam, function (err, results) {  // 과제 생성
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
};

exports.update = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * assignId
	 * title
	 * description
	 * filePath
	 * startDate
	 * endDate
	 *******************************/
		// 유효성 검사
	var token = req.query['token'];
	if (!req.query['assignId'] || !req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'assign id\' or \'lecture id\''
		});
	}

	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
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
				var selectQuery = 'SELECT * FROM assignment WHERE lectureId = ? && assignId = ? && type = 0';
				var selectParams = [req.query['lectureId'], req.query['assignId']];
				connection.query(selectQuery, selectParams, function(err, results) {
					if (err) {
						connection.release();
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					if (results.length == 0) { // 바꾸려는 과제가 없을 경우 에러
						connection.release();
						response['message'] = 'no created assignment';
						return res.status(210).json(response);
					}
					versionManager.list(req.query[ 'lectureId' ], function (err, results) { // 버전 불러오기
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
};

exports.delete = function(req, res, next) {
	/*******************************
	 * params
	 *
	 * lectureId
	 * assignId
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['assignId'] || !req.query['lectureId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no \'assign id\' or \'lecture id\''
		});
	}
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
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
				var selectQuery = 'SELECT * FROM assignment WHERE lectureId = ? && targetId = ? && type = 2';
				var selectParams = [req.query['lectureId'], req.query['assignId']];
				connection.query(selectQuery, selectParams, function(err, results) { // 이미 삭제된 과제일 경우
					if (err) {
						connection.release();
						response['message'] = err.message;
						return res.status(500).json(response);
					}
					if (results.length != 0) {
						connection.release();
						response['message'] = 'already deleted';  // 이미 삭제된 과제입니다.
						return res.status(210).json(response);
					}
					selectQuery = 'SELECT * FROM assignment WHERE lectureId = ? && assignId = ? && type = 0';
					connection.query(selectQuery, selectParams, function(err, results) {
						if (err) {
							connection.release();
							response['message'] = err.message;
							return res.status(500).json(response);
						}
						if (results.length == 0) { // 해당 과제가 없는 과제일 경우
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
							versionManager.setVersion(req.query['lectureId'], {'assignVer' : param['assignId']}, function() { // 과제 버전 세팅
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
};