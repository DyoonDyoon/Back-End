/**
 * Created by kweonminjun on 2015. 11. 22..
 */

// MODELS
var user = require('./models/user');
var lecture = require('./models/lecture');
var notification = require('./models/notification');
var assignment = require('./models/assignment');
var grade = require('./models/grade');
var submit = require('./models/submit');
var question = require('./models/question');
var answer =  require('./models/answer');

var express = require('express');
var passport = require('passport');

var app = express();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var logger = require('morgan');
var passportConfig = require('./controllers/passport');
var fileManager = require('./controllers/fileManager');
var target = require('./target');
var fs = require('fs');

/*********************************** 미들웨어 설정 ***************************/
if (!module.parent) {
	app.use(logger('dev'));
}

app.use(passport.initialize());
app.use(passport.session());

/*********************************** 서버 상태 확인을 위한 index 페이지 ***************************/
app.get('/', function(req, res){
	res.send('Hello World');
});

/*********************************** 강의 정보 ***************************/
app.get('/lecture_outline', function(req, res) {
	fs.readFile('./config/lectureConfig.json', 'utf8', function (err, data) {
		if (err) {
			res.status(500).json({"message" : "CANNOT find lecture outline information"});
			return;
		}
		res.json(JSON.parse(data));
	});
});

/*********************************** 강의 ***************************/
app.get('/lecture', lecture.get);
app.post('/lecture', lecture.post);
app.delete('/lecture', lecture.delete);

/****************************** 회원 가입 및 로그인 ***************************/
app.post('/login', passportConfig.logIn);
app.post('/join', passportConfig.join);

/*********************************** 공지 ***************************/
app.post('/notification', notification.post);
app.get('/notification', notification.get);
app.put('/notification', notification.update);
app.delete('/notification', notification.delete);

/*********************************** 과제 ***************************/
app.post('/assignment', assignment.post);
app.get('/assignment', assignment.get);
app.put('/assignment', assignment.update);
app.delete('/assignment', assignment.delete);

/*********************************** 레포트 ***************************/
app.post('/submit', submit.post);
app.get('/submit', submit.get);
app.put('/submit', submit.update);
app.delete('/submit', submit.delete);

/*********************************** 점수 ***************************/
app.post('/grade', grade.post);
app.get('/grade', grade.get);
app.put('/grade', grade.update);
app.delete('/grade', grade.delete);

/*********************************** 질문 ***************************/
app.post('/question', question.post);
app.get('/question', question.get);
app.put('/question', question.update);
app.delete('/question', question.delete);

/*********************************** 답변 ***************************/
app.post('/answer', answer.post);
app.get('/answer', answer.get);
app.put('/answer', answer.update);
app.delete('/answer', answer.delete);

/*********************************** 회원정보 ***************************/
app.put('/user', user.update);

/*********************************** 파일 업로드 ***************************/
app.post('/fileTest', upload.single('file'), fileManager.upload);

var port = (target === 'ALPHA') ? 3001 : 80;  // 타겟 별 포트 설정

var server = app.listen(port, function() {  // 서버 request Listen
    console.log('Listening on port %d', server.address().port);
});
