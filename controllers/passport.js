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
			usernameField : 'userId',
			passwordField : 'password'
		},
		function(username, password, done) {
			connectionPool.getConnection(function(err,connection){
				if(err){
					return done(null, false);
				}
				var selectSql = 'SELECT * FROM user WHERE userId = ?';
				connection.query(selectSql, [username], function(err,rows,fields){
					if(err){
						connection.release();
						return done(null, false);
					}
					if(!rows.length){ // 아이디가 없을 경우
						connection.release();
						return done(null, false, {
							'code' : 11,
							'message':'user not found'
						});
					}
					var user = {};
					user.userId = rows[0].userId;
					user.name = rows[0].name;
					user.major = rows[0].major;
					var sha1 = crypt.createHash('sha1'); // sha1 방식으로 암호화
					sha1.update(password);
					user.password = sha1.digest('hex'); // 암호화한 해시를 16진수로 반환
					if (rows[0].password !== user.password) {
						connection.release();
						return done(null, false, {  // 일치하는 아이디가 없을 경우
							'code' : 12,
							'message' : 'no match password'
						});
					}
					user.type = rows[0].type;
					connection.release();
					return done(null, user);
				});
			});
		})
);

passport.use(
	'join',
	new localStrategy({
			usernameField : 'userId',
			passwordField : 'password'
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
						return done(null, false, {  // 같은 아이디의 유저가 있을 경우
							'code' : 11,
							'message':'user exist'
						});
					}

					var user = {};
					user.userId = username;
					// 비밀번호 해싱
					var sha1 = crypt.createHash('sha1');
					sha1.update(password);
					user.password = sha1.digest('hex');
					connection.release(); // DB 커넥션 클로즈
					return done(null, user);
				});
			});
		})
);

/********************************************
 *  LOGIN
 ********************************************/
exports.logIn = function(req, res, next) {
	// 파라미터 유효성 체킹
	if (!req.query['userId'])
		return res.status(210).json({
			'code': 10,
			'message': 'No userId'
		});
	if (!req.query['password'])
		return res.status(210).json({
			'code': 10,
			'message': 'No password'
		});

	tokenManager.generateToken(req.query[ 'userId' ], function (err, token) {
		if (err) return res.status(500).json(err.message); // token 생성에 실패했을 경우
		passport.authenticate('login', function (err, user, info) {
			if (err) {
				return next(err);
			}
			if (!user) { // user 객체가 없을경우 에러 내용 반환
				return res.status(210).json(info);
			}

			req.logIn(user, function (err) {
				if (err) {
					return next(err);
				}
				return res.json({ // 로그인 성공시 user객체와 accessToken 내용 반환
					'user'        : user,
					'accessToken' : token
				});
			});
		})(req, res, next);
	});
};

/********************************************
 *  JOIN For Admin
 ********************************************/
exports.join = function(req, res, next) {
	// 파라미터 유효성 체킹
	if (!req.query['userId'])
		return res.status(210).json({
			'code': 10,
			'message': 'No userId'
		});
	if (!req.query['password'])
		return res.status(210).json({
			'code': 10,
			'message': 'No password'
		});

	// 회원가입 authentication 확인
	passport.authenticate('join', function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) { // user 객체가 없을 경우 에러 내용 반환
			return res.status(210).json(info);
		}
		connectionPool.getConnection(function(err, connection){
			if(err){
				connection.release();
				return res.status(210).json({ // DB에 접속 불가
					'code' : 14,
					'message' : 'CANNOT connect the database'
				});
			}

			// DB에 user 레코드 추가
			user.major = req.query['major'];
			user.name = req.query['name'];
			user.type = req.query['type'];
			var insertSql = 'INSERT INTO user(id, userId, password, name, major, type) VALUES(NULL, ?, ?, ?, ?, ?)';
			var queryParam = [user.userId, user.password, user.name, user.major, user.type];
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
