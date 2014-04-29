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
        }
};
