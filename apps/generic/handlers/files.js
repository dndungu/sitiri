"use strict"
var fs = require('fs');
module.exports = {
	"get": function(){
			var args = arguments[0];
			args.data({action: "to list requested images"});
			args.end()
	},
	"post": function(){
		return {action : 'to register users'};
	},
	"put": function(){
		var args = arguments[0];
		var upload = require('../lib/upload.js');
		try{
			upload.mkdir(args);
			upload.save(args);
		}catch(error){
			args.error(error);
		}
	},
	"delete": function(){
		return {action : 'to delete'};
	}
};
