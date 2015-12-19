/**
 * Created by kweonminjun on 2015. 11. 26..
 */
var target = require('../target');
var alpha = { // 알파버전 데이터베이스 configuration
	host     : 'localhost',
	user     : 'root',
	password : '1234',
	database : 'eclass'
};

var general = { // 상용버전 데이터베이스 configuration
	host     : '192.168.1.171',
	user     : 'minz',
	password : 'S6T2wtDzH5y8WACv',
	database : 'mini_e-class'
};

module.exports = (target === 'ALPHA') ? alpha : general; // 타겟 체킹을 통한 configuration 반환