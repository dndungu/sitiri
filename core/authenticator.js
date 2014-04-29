var crypto = require('crypto');
var algorithm = 'aes256';
var context = {};

var _private = {
	execute: function(){
		context = arguments[0].data;
		var userID = _private.getUserID();
		userID ? _private.findUserByID(userID) : _private.onUserQueryEmpty();
	},
	getUserID: function(){
                var key = context.get('settings').key;
                var _s = context.get("cookies").find('_s');
                return _s ? _private.decrypt(_s, key) : null;		
	},
	findUserByID: function(userID){
		context.get("storage").get("global").collection("site").find({"_id" : userID}).toArray(function(error, items){
			return error ? _private.onQueryError(error) : (items.length ? _private.onUserQueryComplete(items) : _private.onUserQueryEmpty());
		});
	},
	onQueryError: function(){
		context.log(2, arguments[0]);
		context.broker.emit({type : "authenticator.failed", data :  context});
	},
	onUserQueryComplete: function(){
		context.set('user', arguments[0][0]);
		_private.findPermissions(context);
	},
	onUserQueryEmpty: function(){
		context.set('permissions', ['public']);
		_private.authorisePortlets(context);
	},
	findPermissions: function(){
		var roles = context.get('user').roles;
		var permissions = ['public'];
		context.get("storage").get("global").collection("site").find({"_id" : {$in : roles}}).toArray(function(error, items){
			return error ? _private.onQueryError(error) : function(roles){
                                for(var i in roles){
                                        for(j in roles[i].permissions){
                                                permissions.push(roles[i].permissions[j]);
                                        }
                                }
				context.set('permissions', permissions);
				_private.authorisePortlets();
			}(items);
		});
	},
	authorisePortlets: function(){
		var portlets = _private.getAuthorisedPortlets();
		if(portlets.length){ 
			context.set('portlets', portlets);
			context.get("broker").emit({type : "authenticator.passed", data : context});
		}else{
			context.get("broker").emit({type : "authenticator.failed", data : context});
		}
	},
	getAuthorisedPortlets: function(){
                var route = context.get('route');
                var assigned = context.get('permissions');
                var portlets = [];
                for(var i in route.portlets){
                        var portlet = route.portlets[i];
                        var required = route.portlets[i].permissions;
                        if(_private.checkClearance(assigned, required)){
                                portlets.push(portlet);
                        }
                }
                return portlets;
	},
        checkClearance : function(){
                var assigned = arguments[0];
                var required = arguments[1];
                for(var i in required){
                        if(assigned.indexOf(required[i]) != -1){
                                return true;
                        }
                }
                return false;
        },
        encrypt : function(){
                var text = arguments[0];
                var key = arguments[1];
                var cipher = crypto.createCipher(algorithm, key);
                return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        },
        decrypt : function(){
                var hash = arguments[0];
                var key = arguments[1];
                var decipher = crypto.createDecipher(algorithm, key);
                return decipher.update(hash, 'hex', 'utf8') + decipher.final('utf8');
        }
};

module.exports = {
	init: function(){
		var context = arguments[0];
		context.get("broker").on(['routing.passed'], _private.execute);
	}
};
