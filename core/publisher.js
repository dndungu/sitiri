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
			var name = typeof i == 'number' ? 'node-' + i : i;
			var value = ['number', 'boolean', 'string'].indexOf(typeof content[i]) == -1 ? _private.buildXML(content[i], xml) : String(content[i]);
			xml.push('<'+name+'>'+value+'</'+name+'>');
		}
		return xml;
	},
	toHTML : function(){
		var context = arguments[0];
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
		broker.on(["app.content"], function(){
			var context = arguments[0].data.context;
			var content = arguments[0].data.content;
			_private.printHeader({code: 206, context: context, type: _private.getContentType(context)});
			_private.printContent({content: content, context: context});
		});
		broker.on(["app.header"], function(){
			var code = arguments[0].data.code;
			var context = arguments[0].data.context;
			_private.printHeader({code: code, context: context, type: 'text/plain'});
		});
		broker.on(["app.passed", "app.failed"], function(){
			var context = arguments[0].data.context;
			var module = arguments[0].data.portlet.module;
			var controller = arguments[0].data.portlet.controller;
			var queue = context.get("queue");
			context.set("queue", --queue);
			queue || context.get("response").end();
		});
	}
};
