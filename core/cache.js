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
		var appname = app.app;
		var handler = app.handler;
		var context = arguments[1];
		var broker = context.get("broker");
		var method = context.get("method");
		var maxAge = (new Date()).getTime() - (app.cache * 1000);
		if (store[appname] && store[appname][handler] && store[appname][handler][method] && store[appname][handler][method].creationTime > maxAge) {
			broker.emit({type: "cache.data", data: {context: context, app: app, content: store[appname][handler][method].content}});
		}else{
			context.get("broker").emit({type: "cache.missing", data: {context: context, app: app}});
		}
	},
	save: function(){
		var context = arguments[0].data.context;
		var method = context.get("method");
		var app = arguments[0].data.app;
		var appname = app.app;
		var handler = app.handler;
		var content = arguments[0].data.content;
		var t = (new Date()).getTime();
		store[appname] = store[appname] ? store[appname] : {};
		store[appname][handler] = store[appname][handler] ? store[appname][handler] : {};
		store[appname][handler][method] = store[appname][handler][method] ? store[appname][handler][method] : {};
		store[appname][handler][method] = {creationTime : t, content : content};
	}
};

module.exports = {
	init: function(){
		var context = arguments[0];
		var broker = context.get("broker");
		broker.on(['authenticator.passed'], _private.execute);		
		broker.on(["app.data"], _private.save);
	}
};
