"use strict"
var cache = {};

var _private = {
	execute: function(){
		var context = arguments[0].data.context;
		var portlet = arguments[0].data.portlet;
		var broker = context.get("broker");
		var module = portlet.module;
		var controller = portlet.controller;
		var handler =  require('../modules/' + module + '/controllers/' + controller + '.js');
		switch(context.get('method')){
			case 'GET':
				handler.doGet({
						context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, portlet: portlet}});	
						},
						end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, portlet: portlet}});
						},
						error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, portlet: portlet}});
						}
				});
				break;
			case 'POST':
                handler.doPost({
                        context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, portlet: portlet}});
						},
                        end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, portlet: portlet}});
                        },
                        error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, portlet: portlet}});
                        }
                });
				break;
			case 'PUT':
                handler.doPut({
                        context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, portlet: portlet}});
						},
                        end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, portlet: portlet}});
                        },
                        error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, portlet: portlet}});
                        }
                });

				break;
			case 'DELETE':
                handler.doDelete({
                        context: context,
						data: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.data", data: {content: content, context: context, portlet: portlet}});
						},
                        end: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.end", data: {content: content, context: context, portlet: portlet}});
                        },
                        error: function(){
							var content = arguments[0] ? arguments[0] : null;
							broker.emit({type: "app.error", data: {content: content, context: context, portlet: portlet}});
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
