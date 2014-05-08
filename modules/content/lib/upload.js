"use strict"
var fs = require('fs');
module.exports = {
	save: function(){
		var options = arguments[0];
		options.flag = options.flag ? options.flag : 'w';
		var request = options.context.get('request');
		options.encoding = options.encoding ? options.encoding : request._readableState.defaultEncoding;
		options.mode = options.mode ? options.mode : '0755';
		var _id = options.context.get('storage').uuid();
		options.folder = options.folder ? options.folder : 'images';
		var path = this.path(options) + '/' + options.folder + '/' + _id;
		var writer = fs.createWriteStream(path, {flags: options.flag, encoding: options.encoding, mode: options.mode});
		request.pipe(writer);
		request.on('end', options.end);
		request.on('error', options.error);
		request.on('close', options.error);
		return _id;
	},
	mkdir: function(){
		var options = arguments[0];
		var path = this.path(options);
		options.mode = options.mode ? options.mode : '0755';
		options.folder = options.folder ? options.folder : 'images';
		try {
			fs.mkdirSync(path, options.mode);
			fs.mkdirSync(path + options.folder, options.mode);
		}catch(error){
			if(error.code != 'EEXIST'){
				throw new Error('Could not create directory '+ path + '/' + options.folder);
			}
		}
	},
	path: function(){
		var options = arguments[0];
		var site_id = options.context.get('site')._id;
		return options.context.get('settings').uploads_dir + '/' + site_id;
	}
};
