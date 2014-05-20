"use strict"
module.exports = function(){
	var _private = {
		events: []
	};
	return {
		context: null,
		on : function() {
			var types = typeof arguments[0] == "string" ? [ arguments[0] ] : arguments[0];
			for ( var i in types) {
				var type = types[i];
				_private.events[type] = typeof _private.events[type] == 'undefined' ? [] : _private.events[type];
				_private.events[type].push(arguments[1]);
			}
		},
		emit : function(event) {
			event = typeof event == "string" ? {type : event, data : new Object()} : event;
			event.data = typeof event.data == "undefined" ? new Object() : event.data;
			this.context && this.context.log(5, event.type);
			var listeners = _private.events[event.type];
			listeners || (this.context && this.context.log(4, 'There  are no listeners for event : "' + event.type + '"'));
			for(var i in listeners){
				try {
					typeof listeners[i] === 'function' && listeners[i](event);
				}catch(e){
					console.log(e);
				}
			}
		},
		reset: function(){
			_private.events = [];
		}
	}
};
