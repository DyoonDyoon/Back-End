/**
 * Created by kweonminjun on 2015. 11. 22..
 */
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var dbConfig = require('../database');
var mysql = require('mysql');
var connectionPool = mysql.createPool(dbConfig);

module.exports = function(){

}