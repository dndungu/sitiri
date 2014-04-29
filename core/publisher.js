
var _private = {
	print : function(){
		var code = arguments[0];
		var context = arguments[1];
		var response = context.get('response');
		switch(code){
			case 200:
				_private.printContent(context);
				break;
			case 403:
				response.writeHead(403, {'Content-Type': 'text/plain'});
				response.end('403 Forbidden');
				break;
			case 404:
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.end('404 - Not Found.');
				break;
		}
	},
	printContent : function(){
		var context = arguments[0];
		var response = context.get('response');
		switch(context.get('route').type){
			case "xml":
				response.writeHead(200, {'Content-Type': 'text/xml'});
				response.end(_private.toXML(context.get('content')));
			break;
			case "html":
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.end(_private.toHTML(context));
			break;
			case "text":
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.end(JSON.stringify(context.get('content')));
			break;
			case "json":
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify(context.get('content')));
			break;
		}
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
		var xml = xslt.readXmlString(_private.toXML(context.get('content')));
		return xslt.transform(stylesheet, xml, []);
	}
};

module.exports = {
	init : function(){
		var context = arguments[0];
                context.get("broker").on(['authenticator.failed'], function(){
                        _private.print(403, context);
                });
		context.get("broker").on(['routing.failed', 'aliasing.failed'], function(){
			_private.print(404, context);
		});
		context.get("broker").on(['operator.passed'], function(){
			_private.print(200, context);
		});
	}
};
