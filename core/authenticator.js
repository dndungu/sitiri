"use strict"
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
				context.set('permissions', ['public.permission']);
				_private.authoriseApps(context);
		},
		findPermissions: function(){
				var roles = context.get('user').roles;
				var permissions = ['public.permission'];
				context.get("storage").get("global").collection("site").find({"_id" : {$in : roles}}).toArray(function(error, items){
					return error ? _private.onQueryError(error) : function(roles){
										for(var i in roles){
												for(j in roles[i].permissions){
														permissions.push(roles[i].permissions[j]);
												}
										}
						context.set('permissions', permissions);
						_private.authoriseApps();
					}(items);
				});
		},
		authoriseApps: function(){
				var apps = _private.getAuthorisedApps();
				if(apps.length){ 
					context.set('apps', apps);
					context.set("queue", apps.length);
					context.get("broker").emit({type : "authenticator.passed", data : context});
				}else{
					context.get("broker").emit({type : "authenticator.failed", data : context});
				}
		},
		getAuthorisedApps: function(){
				var route = context.get('route');
				var assigned = context.get('permissions');
				var apps = [];
				for(var i in route.apps){
						var app = route.apps[i];
						var required = route.apps[i].permissions;
						if(_private.checkClearance(assigned, required)){
								apps.push(app);
						}
				}
				return apps;
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
