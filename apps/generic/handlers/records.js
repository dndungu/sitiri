"use strict"

var fs = require('fs');

module.exports = {
	"get": function(){
		
	},
	"post": function(){
		var args = arguments[0];
		var context = args.context;
		var uri = context.get('uri');
		var parser = require('../lib/parser.js');
		var args = arguments[0];
		var data = {_id: (args.context.get('storage').uuid())};
		args.data(data);
		args.end();
	},
	"put": function(){
		this.post(arguments[0]);
	},
	"delete": function(){
		
	}
};
