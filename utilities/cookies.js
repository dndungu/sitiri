module.exports = function(){
	var _private = {
		store: {
			cookies: []
		},
		parse: function(headers){
					},
		parseSetCookie: function(items){
			for(var i in items){
				var item = items[i];
				var properties = item.split(';');
				var identity = (properties.shift()).split('=');
				var cookie = {name: identity[0], value: identity[1], path: "/", expires: undefined, secure: false};
				for(var j in properties){
					var property = properties[j].split('=');
					var key = String(property[0]).trim().toLowerCase();
					var value = property[1] ?  String(property[1]).trim() : null;
					cookie[key] = value;
				}
				_private.store.cookies.push(cookie);
			}
		},
		parseCookie: function(source){
			source = typeof source == 'string' ? source : "";
			var items = source.split(';');
			for(var i in items){
				var item = (items[i]).split('=');
				var cookie = {name: item[0], value: item[1], path: "/", expires: undefined, secure: false};
				_private.store.cookies.push(cookie);
			}
		}
	};
	return {
		push : function(){
			_private.store.cookies = _private.store.cookies ? _private.store.cookies : [];
			_private.store.cookies.push(arguments[0]);
		},
		find : function(){
			var name = arguments[0];
			var cookies = {};
			for(var i in _private.store.cookies){
				var cookie = _private.store.cookies[i];
				if(name && cookie.name == name){
					return cookie.value;
				}else{
					cookies[name] = cookie;
				}
			}
			return name ? null : cookies;
		},
		parse: function(headers){
				headers["cookie"] ? _private.parseCookie(headers['cookie']) : (headers["set-cookie"] ? _private.parseSetCookie(headers['set-cookie']) : null);
		},
		toCookieString: function(){
			var arr = [];
			for(var i in _private.store.cookies){
				arr.push(_private.store.cookies[i].name + '=' + _private.store.cookies[i].value + ';');
			}
			return arr.join('');
		},
		toSetCookieString: function(){
			//TODO create set cookie string
		}
	}
};
