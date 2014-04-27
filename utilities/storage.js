var mongodb = require('mongodb');

module.exports = {
        db : function(settings){
                var server = new mongodb.Server(settings.database.host, settings.database.port, settings.database.server_options);
                return new mongodb.Db(settings.database.name, server, settings.database.db_options);
        }
};
