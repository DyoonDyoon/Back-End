/**
 * Created by kweonminjun on 2015. 11. 26..
 */
var mysql      = require('mysql');
var connectionPool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'eclass'
});

module.exports = function() {
    return connectionPool;
};