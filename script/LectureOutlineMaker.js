/**
 * Created by kweonminjun on 2015. 12. 5..
 */
var xlrd = require('node-xlrd');
var fs = require('fs');
var sheet = null;
var lectureOutlines = [];
var exec = require('child_process').exec;
var config = require('../config/lectureConfig.json');

config['version'] += 1;


// 엑셀 파일을 json으로 변경
xlrd.open('./xls/'+ config['version'] +'.xls', function(err, book) {
		sheet = book.sheet.byIndex(0);  // 액셀 시트 불러오기
		for (var i = 1; i < sheet.row.count; ++i) { // 시트에서 하나씩 읽어 쓰기
			l                 = {};
			l[ 'curriculum' ] = sheet.cell.getRaw(i, 1);
			l[ 'lecture_id' ] = sheet.cell.getRaw(i, 3);
			if (l[ 'lecture_id' ] == 0) continue;
			l[ 'title' ]          = sheet.cell.getRaw(i, 4);
			l[ 'professor_name' ] = sheet.cell.getRaw(i, 5);
			l[ 'point' ]          = sheet.cell.getRaw(i, 9);
			lectureOutlines.push(l);
		}

		fs.writeFile('./json/' + config['version'] + '.json', JSON.stringify(lectureOutlines), function(err) { // 변경한 JSON 파일로 쓰기
			if(err) throw err;
			console.log('File write completed : %d elements', lectureOutlines.length);
			exec('git add ./json/' + config['version'] + '.json', function (error, stdout, stderr) { // 저장한 JSON 파일 git에 올리기
				if (error !== null) console.log('exec error: ' + error);
				exec('git commit -m "add file ' + config['version'] + '.json"', function (error, stdout, stderr) {  // 커밋
					if (error !== null) console.log('exec error: ' + error);
					exec('git push origin master', function (error, stdout, stderr) { // push하기
						if (error !== null) console.log('exec error: ' + error);
						console.log('success for upload! : '+ config['version']+'.json'); // 성공적으로 업로드
						config['URL'] = 'https://rawgit.com/DyoonDyoon/Back-End/master/script/json/'+config['version']+'.json'; // cdn URL
						fs.writeFile('../config/lectureConfig.json', JSON.stringify(config), function(err) { // cdn URL 및 버전 갱신
							if (err) throw err;
						});
					});
				});
			});
		});
	}
);