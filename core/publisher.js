"use strict"
var http = require("http");
var _private = {
	printHeader: function(){
		var code = arguments[0].code;
		var context = arguments[0].context;
		var type = arguments[0].type;
		var response = context.get('response');
		response.headersSent || response.writeHead(code, {'Content-Type': type});
		(code > 199 && code <  299) || response.write(code + ' - ' + http.STATUS_CODES[code]);
	},
	printContent : function(){
		var content = arguments[0].content;
		var context = arguments[0].context;
		var response = context.get('response');
		switch(context.get('route').type){
			case "xml":
				response.write(_private.toXML(content));
				break;
			case "html":
				response.write(_private.toHTML(context, content));
				break;
			case "text":
				response.write(JSON.stringify(content));
				break;
			case "json":
				response.write(JSON.stringify(content));
				break;
		}
		response.write("\n");
	},
	getContentType: function(){
		var context = arguments[0];
		var type = context.get('route').type;
		return type == "xml" ? "text/xml" : type == "html" ? "text/html" : type == "json" ? "application/json" : "text/plain";
	},
	toXML : function(){
		var content = arguments[0];
		var xml = _private.buildXML({content : content});
		xml.unshift('<?xml version="1.0"?>');
		return xml.join('\n');
	},
	buildXML : function(){
		var content = arguments[0];
		var xml = [];
		for(var i in content){
			var name = isNaN(i) ? i : 'node-' + String(i);
			var value = ['number', 'boolean', 'string'].indexOf(typeof content[i]) == -1 ? _private.buildXML(content[i], xml) : String(content[i]);
			xml.push('<'+name+'>'+value+'</'+name+'>');
		}
		return xml;
	},
	toHTML : function(){
		var context = arguments[0];
		var content = arguments[1];
		var xslt = require('node_xslt');
		var stylesheet = xslt.readXsltFile('./templates/' + context.get('site').settings.theme + '/' + context.get('route').stylesheet);
		var xml = xslt.readXmlString(_private.toXML(content));
		return xslt.transform(stylesheet, xml, []);
	}
};

module.exports = {
	init : function(){
		var context = arguments[0];
		var broker = context.get("broker");
                broker.on(['authenticator.failed'], function(){
			var context = arguments[0].data;
                        _private.printHeader({code: 403, context: context});
			context.get("response").end()
                });
		broker.on(['routing.failed', 'aliasing.failed'], function(){
			var context = arguments[0].data;
			_private.printHeader({code: 404, context: context, type: 'text/plain'});
			context.get("response").end()
		});
		broker.on(["app.data", "cache.data"], function(){
			var args = arguments[0];
			var context = args.data.context;
			var type = _private.getContentType(context);
			var sync = context.get("route").sync;
			sync || _private.printHeader({code: 206, type: type, context: context});
			sync ? context.buffer(args.data) : _private.printContent(args.data);
		});
		broker.on(["app.end", "app.error", "cache.data"], function(){
			var context = arguments[0].data.context;
			var type = _private.getContentType(context);
			var sync = context.get("route").sync;
			var queue = (context.get("queue") - 1);
			queue && context.set("queue", queue);
			queue || (sync && _private.printHeader({code: 200, type: type, context: context}));
			queue || (sync && _private.printContent({context: context, content: context.get("buffer")}))
			queue || context.get("response").end();
		});
	}
};
