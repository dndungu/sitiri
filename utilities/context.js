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
		log: function(severity, message){
			console.log(message);
			_private.log.push(severity, message);
		}
	}
};
