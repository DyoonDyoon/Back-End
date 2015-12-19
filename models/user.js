/**
 * Created by kweonminjun on 2015. 11. 25..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('../controllers/tokenManager');

exports.update = function (req, res, next) {
	/*******************************
	 * params
	 *
	 * userId :
	 * password :
	 * major :
	 * name :
	 *******************************/
	// 파라미터 유효성 검사
	if (!req.query['userId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no user id'
		});
	}
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) { // 토큰 유효성 검사 및 갱신
		if (code !== 200)
			return res.status(code).json(result);

		var param = req.query;
		var userId = req.query['userId'];
		delete param['token'];
		delete param['userId'];
		connectionPool.getConnection(
			function(err, connection) {
				connection.release();
				if (err) {
					return res.status(500).json({
						'error' : err.message
					});
				}
				var updateQuery = 'UPDATE user SET ? WHERE userId = ?';
				var updateParam = [param, userId];
				connection.query(updateQuery, updateParam, function(err, results) { // 유저 정보 변경
					if (err) {
						return res.status(500).json({
							'error' : err.message
						});
					}
					return res.status(200).json({
						'message' : 'Success for update user information'
					});
				});
			}
		);
	});
};

