"use strict"
var fs = require('fs');
module.exports = function(){

	var _private = {
		store: {},
		log: []
	};

	return {
		set : function(name, value) {
			_private.store[name] = value;
			return this;
		},
		get : function(name) {
			return _private.store[name] ? _private.store[name] : null;
		},
		buffer: function(){
			var args = arguments[0];
			var app = args.app.app;
			var handler = args.app.handler;
			_private.store.buffer = _private.store.buffer ? _private.store.buffer : {};
			_private.store.buffer[app] = _private.store.buffer[app] ? _private.store.buffer[app] : {};
			_private.store.buffer[app][handler] = _private.store.buffer[app][handler] ? _private.store.buffer[app][handler] : [];
			_private.store.buffer[app][handler].push(args.content);
			return this;
		},
		log: function(severity, message){
			var logfile = _private.store.settings.debug.file;
			var uri = _private.store.uri;
			var method = _private.store.method;
			if(severity > _private.store.settings.debug.level) return;
			var line = (new Date()) + ' (' + severity + ') : [' + uri + '] ' + ' {' + method + '} ' + (JSON.stringify(message)) + "\n";
			fs.appendFile(logfile, line);
			return this;
		}
	}
};
