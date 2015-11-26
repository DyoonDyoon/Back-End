/**
 * Created by kweonminjun on 2015. 11. 25..
 */
var users = [{ name: '권민준', email: 'minz@dgu.edu'}];

exports.list = function (req, res) {
    res.json(users);
}