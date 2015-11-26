/**
 * Created by kweonminjun on 2015. 11. 22..
 */
var localStrategy = require('passport-local').Strategy;
var dbConfig = require('../database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);
var passport = require('passport');

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
                var selectSql = 'SELECT id, userId, password FROM user WHERE userId = ?';
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
                    user.password = rows[0].password;
                    if (user.password !== password) {
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

/********************************************
 *  LOGIN
 ********************************************/
exports.logIn = function(req, res, next) {
    if (req.query['id'].length === 0)
        return res.status(210).json({
            'code': 10,
            'message': 'No userId'
        });
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
            return res.json(user);
        });
    })(req, res, next);
}