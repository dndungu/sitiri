module.exports = {
	doGet : function(){
                var context = arguments[0].context;
		var portlet = arguments[0].portlet;
                var broker = context.get("broker");
		broker.emit({type: "app.content", data: {context: context, portlet: portlet, content: {action : 'to register users'}}});
                broker.emit({type: "app.passed", data: {context: context, portlet: portlet}});
	},
	doPost : function(){
		return {action : 'to register users'};
	},
	doPut	: function(){
                var context = arguments[0].context;
                var portlet = arguments[0].portlet;
                var broker = context.get("broker");
                broker.emit({type: "app.content", data: {context: context, portlet: portlet, content: {action : 'to upload files'}}});
                broker.emit({type: "app.passed", data: {context: context, portlet: portlet}});
	},
	doDelete: function(){
		return {action : 'to delete'};
	}

};
