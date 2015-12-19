/**
 * Created by kweonminjun on 2015. 12. 6..
 */

exports.upload = function(req, res, next) {
	// 업로드를 요청할 경우
	console.log(req.file);
	return res.json('Success to send');
};