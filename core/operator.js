"use strict"
var cache = {};

var _private = {
	execute: function(){
		var context = arguments[0].data.context;
		var app = arguments[0].data.app;
		var broker = context.get("broker");
		var handler =  require('../modules/' + app.module + '/handlers/' + app.handler + '.js');
		switch(context.get('method')){
			case 'GET':
				handler["get"]({
						context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, app: app}});	
						},
						end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, app: app}});
						},
						error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, app: app}});
						}
				});
				break;
			case 'POST':
                handler["post"]({
                        context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, app: app}});
						},
                        end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, app: app}});
                        },
                        error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, app: app}});
                        }
                });
				break;
			case 'PUT':
                handler["put"]({
                        context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, app: app}});
						},
                        end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, app: app}});
                        },
                        error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, app: app}});
                        }
                });

				break;
			case 'DELETE':
                handler["delete"]({
                        context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, app: app}});
						},
                        end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, app: app}});
                        },
                        error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, app: app}});
                        }
                });
				break;
		}	
	}
};
module.exports = {
	init : function(){
		var context = arguments[0];
		context.get("broker").on(["cache.missing"], _private.execute);
	}
};
