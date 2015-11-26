/**
 * Created by kweonminjun on 2015. 11. 22..
 */

var express = require('express');
var user = require('./models/user');
var login = require('./controllers/login');
var passport = require('passport');
var app = express();

app.get('/', function(req, res){
    res.send('Hello World');
});

app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        res.send('success');
    });

app.get('/users', user.list);

var server = app.listen(3001, function() {
    console.log('Listening on port %d', server.address().port);
});