"use strict"
var broker = require('../../../utilities/broker.js');
var model = new (require('../lib/model.js'));
module.exports = {
	"get": function(){
		var args = arguments[0];
		model.init(args);
		var uri = args.context.get('uri').split('/');
		!uri[uri.length -1] && uri.splice(-1);
		model.find(uri[(uri.length - 1)]);
	},
	"post": function(){
		var args = arguments[0];
		try{
			model.broker = new broker();
			var uri = args.context.get('uri').split('/');
			!uri[uri.length -1] && uri.splice(-1);
			var matches = args.context.get('route').matches;
			var h = 0;
			for(var i in matches){
				var n = matches[i].split('/').length;
				h = n > h ? n : h;
			}
			var l = h - 1;
			if(uri.length < l || uri.length > h) throw new Error('Sorry mate but URI you requested is not valid.');
			uri.length == l ?
			model.broker.on(["data.received"], function(){
				model.insert(model.sanitize(arguments[0].data));
			}) :
			model.broker.on(["data.received"], function(){
				model.update(uri[(uri.length - 1)], model.sanitize(arguments[0].data));
			});
			args.operation = uri.length == l ? "insert" : "update";
			model.init(args);
			model.parse();
		} catch(error){
			args.error(error);
		}	
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
        var args = arguments[0];
        model.init(args);
        var uri = args.context.get('uri').split('/');
        !uri[uri.length -1] && uri.splice(-1);
        model.remove(uri[(uri.length - 1)]);
	}
};
