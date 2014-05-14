"use strict"
module.exports = {
	findDefinition: function(){
		args = arguments[0];
		url = args.context.get("url")
		console.log(url)
	}
};
