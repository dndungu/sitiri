var mongodb = require('mongodb');

var _private = {
	store : {}
};

module.exports = {
	set : function(){
			_private.store[arguments[0]] = arguments[1];
	},
	get : function(){
			var key = arguments[0];
			return _private.store[key] ? _private.store[key] : null;
	},	
	db : function(settings){
			var server = new mongodb.Server(settings.database.host, settings.database.port, settings.database.server_options);
			return new mongodb.Db(settings.database.name, server, settings.database.db_options);
	},
	uuid: function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	},
	timestamp: function(){
		return (new Date()).getTime();
	}
};
