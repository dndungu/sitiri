module.exports = function(){

	var _private = {
		store: {},
		log: []
	};

	return {
		set : function(name, value) {
			_private.store[name] = value;
		},
		get : function(name) {
			return _private.store[name] ? _private.store[name] : null;
		},
		buffer: function(){
			var args = arguments[0];
			var module = args.portlet.module;
			var controller = args.portlet.controller;
			_private.store.buffer = _private.store.buffer ? _private.store.buffer : {};
			_private.store.buffer[module] = _private.store.buffer[module] ? _private.store.buffer[module] : {};
			_private.store.buffer[module][controller] = _private.store.buffer[module][controller] ? _private.store.buffer[module][controller] : [];
			_private.store.buffer[module][controller].push(args.content);
		},
		log: function(severity, message){
			console.log(message);
			_private.log.push(severity, message);
		}
	}
};
