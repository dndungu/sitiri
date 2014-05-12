"use strict"

var store = {};

var _private = {
	execute: function(){
		var context = arguments[0].data;
		var apps = context.get('apps');
		for(var i in apps){
			var app = apps[i];
			if(app.cache > 0){
				_private.find(app, context);
			}else{
				context.get("broker").emit({type: "cache.missing", data: {context: context, app: app}});
			}
		}
	},
	find: function(){
                var app = arguments[0];
                var module = app.module;
                var controller = app.controller;
                var context = arguments[1];
		var broker = context.get("broker");
		var method = context.get("method");
                var maxAge = (new Date()).getTime() - (app.cache * 1000);
		if (store[module] && store[module][controller] && store[module][controller][method] && store[module][controller][method].creationTime > maxAge) {
			broker.emit({type: "cache.content", data: {context: context, app: app, content: store[module][controller][method].content}});
		}else{
			context.get("broker").emit({type: "cache.missing", data: {context: context, app: app}});
		}
	},
	save: function(){
		var context = arguments[0].data.context;
		var method = context.get("method");
		var app = arguments[0].data.app;
		var module = app.module;
		var controller = app.controller;
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
