
var cache = {};

var _private = {
	execute : function(){
		var context = arguments[0].data;
		var portlets = context.get('portlets');
		var method = context.get('method');
		var content = {};
		for(var i in portlets){
			var portlet = portlets[i];
			var module = portlet.module;
			var controller = portlet.controller;
			var output = null;
			if(portlet.cache > 0 && _private.inCache(portlet, context)){
				output = cache[module][controller][method].content;
			}else{
				output = _private.executeController(portlet, context);
				if(portlet.cache > 0){
					_private.addToCache(module, controller, method, output);
				}
			}
			content[module] = {};
			content[module][controller] = output;
		}
		context.set('content', content);
		context.get("broker").emit({type : 'operator.passed', data : context});
	},
	executeController : function(){
		var portlet = arguments[0];
		var context = arguments[1];
		var controller =  require('../modules/' + portlet.module + '/controllers/' + portlet.controller + '.js');
		switch(context.get('method')){
			case 'GET':
				return controller.doGet(context);
				break;
			case 'POST':
				return controller.doPost(context);
				break; 
			case 'PUT':
				return controller.doPut(context);
				break;
			case 'DELETE':
				return controller.doDelete(context);
				break;
		}
	},
	addToCache : function(module, controller, method, output){
		var t = (new Date()).getTime();
		cache[module] = cache[module] ? cache[module] : {};
		cache[module][controller] = cache[module][controller] ? cache[module][controller] : {};
		cache[module][controller][method] = cache[module][controller][method] ? cache[module][controller][method] : {};
		cache[module][controller][method] = {creationTime : t, content : output};
	},
	inCache : function(){
		var portlet = arguments[0];
		var module = portlet.module;
		var controller = portlet.controller; 
		var context = arguments[1];
		var method = context.get('method');
		var maxAge = (new Date()).getTime() - (portlet.cache * 1000);
		return (cache[module] && cache[module][controller] && cache[module][controller][method] && cache[module][controller][method].creationTime > maxAge);
	}
};
module.exports = {
	init : function(){
		var context = arguments[0];
		context.get("broker").on(['authenticator.passed'], _private.execute);
	}
};
