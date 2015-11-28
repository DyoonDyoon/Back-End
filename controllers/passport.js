/**
 * Created by kweonminjun on 2015. 11. 22..
 */
var localStrategy = require('passport-local').Strategy;
var dbConfig = require('../config/database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var crypt = require('crypto');
var passport = require('passport');
var tokenManager = require('./tokenManager');
var async = require('async');

/********************************************
 *  CONFIGURATION SETTING
 ********************************************/
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(
    'login',
    new localStrategy({
            usernameField : 'id',
            passwordField : 'pw'
        },
        function(username, password, done) {
            connectionPool.getConnection(function(err,connection){
                if(err){
                    return done(null, false);
                }
                var selectSql = 'SELECT id, userId, password, name, major FROM user WHERE userId = ?';
                connection.query(selectSql, [username], function(err,rows,fields){
	                if(err){
		                connection.release();
		                return done(null, false);
	                }
                  if(!rows.length){
	                  connection.release();
                    return done(null, false, {
                      'code' : 11,
                      'message':'user not found'
                    });
                  }
                  var user = {};
                  user.userId = rows[0].userId;
	                user.name = rows[0].name;
	                user.major = rows[0 ].major;
	                var sha1 = crypt.createHash('sha1');
	                sha1.update(password);
                  user.password = sha1.digest('hex');
                  if (rows[0].password !== user.password) {
                    connection.release();
                    return done(null, false, {
                      'code' : 12,
                      'message' : 'no match password'
                    });
                  }
                    connection.release();
                    return done(null, user);
                });
            });
        })
);

passport.use(
	'join',
	new localStrategy({
			usernameField : 'id',
			passwordField : 'pw'
		},
		function(username, password, done) {
			connectionPool.getConnection(function(err,connection){
				if(err){
					return done(null, false);
				}
				var selectSql = 'SELECT id, userId, password FROM user WHERE userId = ?';
				connection.query(selectSql, [username], function(err,rows,fields){
					if(err){
						connection.release();
						return done(null, false);
					}
					if(rows.length){
						connection.release();
						return done(null, false, {
							'code' : 11,
							'message':'user exist'
						});
					}

					var user = {};
					user.userId = username;
					var sha1 = crypt.createHash('sha1');
					sha1.update(password);
					user.password = sha1.digest('hex');
					connection.release();
					return done(null, user);
					});
				});
			})
);

/********************************************
 *  LOGIN
 ********************************************/
exports.logIn = function(req, res, next) {
	if (req.query['id'].length === 0)
		return res.status(210).json({
			'code': 10,
			'message': 'No userId'
		});

	var generateToken = function(req, res, next) {
		tokenManager.generateToken(req.query[ 'id' ], function (err, token) {
			passport.authenticate('login', function (err, user, info) {
				if (err) {
					return next(err);
				}
				if (!user) {
					return res.status(210).json(info);
				}

				req.logIn(user, function (err) {
					if (err) {
						return next(err);
					}
					return res.json({
						'user'        : user,
						'accessToken' : token
					});
				});
			})(req, res, next);
		});
	};

	if (!req.query['token']) {
		tokenManager.existsToken(req.query['id'], function(err, exists) {
			if (exists) {
				return res.status(210).json({
					'code' : 5,
					'message' : 'Invalid Access'
				});
			} else {
				generateToken(req, res, next);
			}
		});
	} else {
		tokenManager.isExpired(req.query[ 'token' ], function (err, status) {
			if (err) {
				return res.status(500).json(err);
			}
			if (status.invalidToken) {
				return res.status(210).json({
					'code'    : 4,
					'message' : 'Invalid Token'
				});
			}
			if (status.expired) {
				return res.status(210).json({
					'code'    : 3,
					'message' : 'session expired'
				});
			}
			generateToken(req, res, next);
		});
	}
};

/********************************************
 *  JOIN For Admin
 ********************************************/
exports.join = function(req, res, next) {
	if (req.query['id'].length === 0)
		return res.status(210).json({
			'code': 10,
			'message': 'No userId'
		});
	if (req.query['pw'].length === 0)
		return res.status(210).json({
			'code': 10,
			'message': 'No password'
		});
	passport.authenticate('join', function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(210).json(info);
		}
		connectionPool.getConnection(function(err, connection){
			if(err){
				connection.release();
				return res.status(210).json({
					'code' : 14,
					'message' : 'CANNOT connect the database'
				});
			}

			user.major = req.query['major'];
			user.name = req.query['name'];
			var insertSql = 'INSERT INTO user(id, userId, password, name, major) VALUES(NULL, ?, ?, ?, ?)';
			var queryParam = [user.userId, user.password, user.name, user.major];
			connection.query(insertSql, queryParam, function(err, results){
				if(err) {
					connection.release();
					console.error(err);
					return res.status(210).json({
						'code' : 13,
						'message' : 'CANNOT insert the record'
					});
				}
				connection.release();
				return res.json(user);
			});
		});
	})(req, res, next);
};