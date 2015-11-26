/**
 * Created by kweonminjun on 2015. 11. 25..
 */
var users = [{ name: '권민준', email: 'minz@dgu.edu'}];

var dbConfig = require('../database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);

exports.list = function (req, res) {
    connectionPool.query('SELECT * FROM user', function(err, rows, fields) {
        if (err) throw err;

        res.json(rows);
    });
}