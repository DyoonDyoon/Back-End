/**
 * Created by kweonminjun on 2015. 11. 26..
 */
var target = require('../target');
var alpha = {
	host     : 'localhost',
	user     : 'root',
	password : '1234',
	database : 'eclass'
}

var general = {
	host     : '192.168.1.171',
	user     : 'minz',
	password : 'S6T2wtDzH5y8WACv',
	database : 'mini_e-class'
}

module.exports = (target === 'ALPHA') ? alpha : general;