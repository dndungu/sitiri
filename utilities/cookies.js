
module.exports = function(){
	var request = arguments[0];
	var _private = {
		store: {}
	};
	return {
		init: function(){
			var cookies = {};
			request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
				var parts = cookie.split('=');
				cookies[ parts.shift().trim() ] = ( parts.join('=') || '' ).trim();
			});
			_private.store.cookies = cookies;
		}(),
		push : function(){
			_private.store.cookies = _private.store.cookies ? _private.store.cookies : [];
			_private.store.cookies.push(arguments[0]);
		},
		find : function(){
			return arguments[0] ? _private.store.cookies[arguments[0]] : _private.store.cookies;
		},
		reset: function(){
			_private.store.cookies = {};
		}
	}
};
