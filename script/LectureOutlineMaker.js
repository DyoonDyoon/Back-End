/**
 * Created by kweonminjun on 2015. 12. 5..
 */
var xlrd = require('node-xlrd');
var fs = require('fs');
var sheet = null;
var lectureOutlines = [];
xlrd.open('2015-2.xls', function(err, book) {
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
		fs.writeFile('./2015-2.json', JSON.stringify(lectureOutlines), function(err) {
			if(err) throw err;
			console.log('File write completed : %d elements', lectureOutlines.length);
		});
	}
);