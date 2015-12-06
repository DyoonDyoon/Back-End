/**
 * Created by kweonminjun on 2015. 12. 6..
 */

exports.upload = function(req, res, next) {
	console.log(req.file);
	return res.json('good');
};