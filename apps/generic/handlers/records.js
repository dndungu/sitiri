"use strict"

var fs = require('fs');

module.exports = {
	"get": function(){
		
	},
	"post": function(){
		var args = arguments[0];
		console.log(args.context.get('uri'));
	},
	"put": function(){
		this.post(arguments[0]);
	},
	"delete": function(){
		
	}
};
