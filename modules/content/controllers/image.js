"use strict"
var fs = require('fs');
module.exports = {
	doGet: function(){
                var context = arguments[0].context;
                var portlet = arguments[0].portlet;
                var broker = context.get("broker");
		broker.emit({type: "app.content", data: {content: {action: "to list requested images"}, context: context, portlet: portlet}});
		broker.emit({type: "app.passed", data: {context: context, portlet: portlet}});
	},
	doPost: function(){
		return {action : 'to register users'};
	},
	doPut: function(){
		var handler = require('../lib/upload.js');
		var context = arguments[0].context;
		var portlet = arguments[0].portlet;
		var broker = context.get("broker");
		try{
			handler.mkdir({context: context});
			var _id = handler.save({
					context: context,
					success: function(){
						broker.emit({type: "app.passed", data: {context: context, portlet: portlet}});
					},
					error: function(){
						broker.emit({type: "app.failed", data: {context: context, portlet: portlet}});
					}
			});
			broker.emit({type: "app.content", data: {content: {_id: _id}, context: context, portlet: portlet}});
		}catch(error){
			broker.emit({type: "app.content", data: {content: {error: error}, context: context, portlet: portlet}});
			broker.emit({type: "app.failed", data: {context: context, portlet: portlet}});
		}
	},
	doDelete: function(){
		return {action : 'to delete'};
	}
};
