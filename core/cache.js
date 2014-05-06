"use strict"

var store = {};

var _private = {
	execute: function(){
		var context = arguments[0].data;
		var portlets = context.get('portlets');
		for(var i in portlets){
			var portlet = portlets[i];
			if(portlet.cache > 0){
				_private.find(portlet, context);
			}else{
				context.get("broker").emit({type: "cache.missing", data: {context: context, portlet: portlet}});
			}
		}
	},
	find: function(){
                var portlet = arguments[0];
                var module = portlet.module;
                var controller = portlet.controller;
                var context = arguments[1];
		var broker = context.get("broker");
		var method = context.get("method");
                var maxAge = (new Date()).getTime() - (portlet.cache * 1000);
		if (store[module] && store[module][controller] && store[module][controller][method] && store[module][controller][method].creationTime > maxAge) {
			broker.emit({type: "cache.content", data: {context: context, portlet: portlet, content: store[module][controller][method].content}});
		}else{
			context.get("broker").emit({type: "cache.missing", data: {context: context, portlet: portlet}});
		}
	},
	save: function(){
		var context = arguments[0].data.context;
		var method = context.get("method");
		var portlet = arguments[0].data.portlet;
		var module = portlet.module;
		var controller = portlet.controller;
		var content = arguments[0].data.content;
                var t = (new Date()).getTime();
                store[module] = store[module] ? store[module] : {};
                store[module][controller] = store[module][controller] ? store[module][controller] : {};
                store[module][controller][method] = store[module][controller][method] ? store[module][controller][method] : {};
                store[module][controller][method] = {creationTime : t, content : content};
	}
};

module.exports = {
	init: function(){
		var context = arguments[0];
		var broker = context.get("broker");
		broker.on(['authenticator.passed'], _private.execute);		
		broker.on(["app.content"], _private.save);
	}
};
