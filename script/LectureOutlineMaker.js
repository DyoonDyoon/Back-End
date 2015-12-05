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

xlrd.open('./xls/'+ config['version'] +'.xls', function(err, book) {
		sheet = book.sheet.byIndex(0);
		for (var i = 1; i < sheet.row.count; ++i) {
			l                 = {};
			l[ 'curriculum' ] = sheet.cell.getRaw(i, 1);
			l[ 'lecture_id' ] = sheet.cell.getRaw(i, 3);
			if (l[ 'lecture_id' ] == 0) continue;
			l[ 'title' ]          = sheet.cell.getRaw(i, 4);
			l[ 'professor_name' ] = sheet.cell.getRaw(i, 5);
			l[ 'point' ]          = sheet.cell.getRaw(i, 9);
			lectureOutlines.push(l);
		}

		fs.writeFile('./json/' + config['version'] + '.json', JSON.stringify(lectureOutlines), function(err) {
			if(err) throw err;
			console.log('File write completed : %d elements', lectureOutlines.length);
			exec('git add ./json/' + config['version'] + '.json', function (error, stdout, stderr) {
				if (error !== null) console.log('exec error: ' + error);
				exec('git commit -m "add file ' + config['version'] + '.json"', function (error, stdout, stderr) {
					if (error !== null) console.log('exec error: ' + error);
					exec('git push origin master', function (error, stdout, stderr) {
						if (error !== null) console.log('exec error: ' + error);
						console.log('success for upload! : '+ config['version']+'.json');
						config['URL'] = 'https://rawgit.com/DyoonDyoon/Back-End/master/script/json/'+config['version']+'.json';
						fs.writeFile('../config/lectureConfig.json', JSON.stringify(config), function(err) {
							if (err) throw err;
						});
					});
				});
			});
		});
	}
);