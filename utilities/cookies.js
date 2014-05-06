
module.exports = function(){
	var cookieString = arguments[0] instanceof Array ? arguments[0] : (typeof arguments[0] == 'string' ? [arguments[0]] : []);
	var _private = {
		store: {
			cookies: {}
		},
		parse: function(source){
			if(!source || !source.length) return;
			for(var i in source){
				var properties = source[i].split(';');
				var firstProperty = properties.shift().split('=');
				var name = firstProperty[0];
				var value = firstProperty[1];
				_private.store.cookies[name] = {name : name, value: value};
				for(var j in properties){
					var property = properties[j].split('=');
					_private.store.cookies[name][property[0]] = property[1];
				}
			}
		}
	};
	_private.parse(cookieString);
	return {
		push : function(){
			_private.store.cookies = _private.store.cookies ? _private.store.cookies : [];
			_private.store.cookies.push(arguments[0]);
		},
		find : function(){
			return arguments[0] ? _private.store.cookies[arguments[0]] ? _private.store.cookies[arguments[0]].value : null : _private.store.cookies;
		},
		parse: _private.parse
	}
};
