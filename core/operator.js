"use strict"
var cache = {};

var _private = {
	execute: function(){
		var context = arguments[0].data.context;
		var portlet = arguments[0].data.portlet;
		var controller =  require('../modules/' + portlet.module + '/controllers/' + portlet.controller + '.js');
		switch(context.get('method')){
			case 'GET':
				controller.doGet({context: context, portlet: portlet});
				break;
			case 'POST':
				controller.doPost({context: context, portlet: portlet});
				break;
			case 'PUT':
				controller.doPut({context: context, portlet: portlet});
				break;
			case 'DELETE':
				controller.doDelete({context: context, portlet: portlet});
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
