/**
 * Created by kweonminjun on 2015. 11. 25..
 */
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var tokenManager = require('../controllers/tokenManager');

exports.list = function (req, res) {
	connectionPool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM user', function (err, rows, fields) {
	    connection.release();
      if (err) throw err;
      return res.json(rows);
    });
  });
};

exports.update = function (req, res, next) {
	/*******************************
	 * params
	 *
	 * userId :
	 * password :
	 * major :
	 * name :
	 *******************************/
	if (!req.query['userId']) {
		return res.status(210).json({
			'code' : 10,
			'message' : 'no user id'
		});
	}
	var token = req.query['token'];
	tokenManager.onePassCheck(token, function(code, result) {
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
				connection.query(updateQuery, updateParam, function(err, results) {
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

