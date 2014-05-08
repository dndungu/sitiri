"use strict"
var fs = require('fs');
module.exports = {
	doGet: function(){
			var args = arguments[0];
			args.data({action: "to list requested images"});
			args.end()
	},
	doPost: function(){
		return {action : 'to register users'};
	},
	doPut: function(){
		var args = arguments[0];
		console.log(args.context.get('request').headers);
		var upload = require('../lib/upload.js');
		try{
			upload.mkdir({context: args.context});
			var _id = upload.save(args);
			args.data({_id: _id});
		}catch(error){
			args.error(error);
		}
	},
	doDelete: function(){
		return {action : 'to delete'};
	}
};
