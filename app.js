/**
 * Created by kweonminjun on 2015. 11. 22..
 */

var express = require('express');
var user = require('./models/user');
var login = require('./controllers/login');
var app = express();
var logger = require('morgan');

if (!module.parent) {
    app.use(logger('dev'));
}

app.get('/', function(req, res){
    res.send('Hello World');
});

app.post('/login', user.list);

app.get('/users', user.list);

var server = app.listen(3001, function() {
    console.log('Listening on port %d', server.address().port);
});