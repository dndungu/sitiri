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
			console.log(message);
			_private.log.push(severity, message);
			return this;
		}
	}
};
