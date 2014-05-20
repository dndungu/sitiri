"use strict"
var fs = require('fs');
module.exports = function(){
	var filename = arguments[0] ? arguments[0] : false;
	filename ? (var locale = fs.readFileSync(filename)) : (var locale = {});
	return {
		translate: function(){
			var key = arguments[0];
			return locale[key] ? locale[key] : key;
		}
	};
};
