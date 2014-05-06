"use strict"
var context = {};
var fs = require("fs");

var _private = {
	execute: function(){
		context = arguments[0].data;
		_private.findSite();
	},
	findSite: function(){
		context.get("storage").get("global").collection("site").find({"alias" : (context.get('host'))}).toArray(function(error, items){
			return error ? _private.onSiteQueryError(error) : (items.length ? _private.onSiteQueryComplete(items) : _private.onSiteQueryEmpty());
		});
	},
	onSiteQueryEmpty: function(){
		context.log(4, 'Could not find a site the domain name : ' + context.get("host"));
		context.get("broker").emit({type : "routing.failed", data : context});
	},
	onSiteQueryComplete: function(){
		context.set('site', arguments[0][0]);
		_private.getRoutes(context);
	},
	onSiteQueryError: function(){
		context.log(1, arguments[0]);
		context.get("broker").emit({type : "routing.failed", data : context});
	},
        getRoutes : function(){
                var site = context.get('site');
		try{
			var routes = require('../sites/' + site.home + '/' + site.routes);
			context.set('routes', routes);
			if(_private.matchRoute()){
				return context.get("broker").emit({type : 'routing.passed', data : context});
			}else{
				context.log(2, 'Could not match route: ' + context.get('uri'));
				return context.get("broker").emit({type : "routing.failed", data : context});
			}
		}catch(e){
			context.log(2, e);
			return context.get("broker").emit({type : "routing.failed", data : context});
		}
        },
	matchRoute: function(){
                var routes = context.get('routes');
                var uri = context.get('uri');
                for(var i in routes){
                        var route = routes[i];
                        var n = uri.length - 1;
                        if(uri == route.uri || uri.substring(0, n) == '*'){
                                context.set('route', route);
                                return true;
                        }
                }
                return false;		
	}
}

module.exports = {
	init: function(){
		var context = arguments[0];
		context.get("broker").on(['controller.passed'], _private.execute);
	}
};
