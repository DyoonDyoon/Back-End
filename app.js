/**
 * Created by kweonminjun on 2015. 11. 22..
 */

var express = require('express');
var passport = require('passport');
var user = require('./models/user');
var app = express();

var logger = require('morgan');
var passportConfig = require('./controllers/passport');

if (!module.parent) {
    app.use(logger('dev'));
}
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
    res.send('Hello World');
});

app.post('/login', passportConfig.logIn);

app.get('/users', user.list);

var server = app.listen(3001, function() {
    console.log('Listening on port %d', server.address().port);
});