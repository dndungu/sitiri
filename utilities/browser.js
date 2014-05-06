var querystring = require('querystring');
var fs = require('fs');
var cookies = require('../utilities/cookies.js');
module.exports = function(){

	var client;

	var options = {
		headers: {},
		hostname: 'localhost',
		port: 8080,
		secure: false
	}

	var _private = {
		cookies: new cookies(),
		store: {}
	}

	var parameters = arguments[0];

	for ( var i in parameters) {
		options[i] = parameters[i];
	}

	client = options.secure ? require('https') : require('http');

	return {
		get: function(){
			var defaults = arguments[0];
			defaults.method = 'GET';
			var request = this.request(defaults);
			request.end();
			return this;
		},
		post: function(){
			var defaults = arguments[0];
			defaults.method = 'POST';
			data = querystring.stringify(data);
			options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			options.headers['Content.length'] = Buffer.byteLength(data,'utf8');
			var request = this.request(defaults);
			request.write(data);
			request.end();
			return this;
		},
		put: function(){
			var defaults = arguments[0];
			defaults.method = 'PUT';
			options.headers['content-type'] = 'multipart/form-data';
			options.headers['content-length'] = fs.statSync(defaults.filename).size;
			var stream = fs.createReadStream(defaults.filename);
			var request = this.request(defaults);
			stream.on('data', function(data){
				request.write(data);
			});
			stream.on('end', function(){
				request.end();
			});
			return this;
		},
		"delete": function(){
			var defaults = arguments[0];
			defaults.method = 'DELETE';
			var request = this.request(defaults);
			request.end();
			return this;
		},
                request: function(){
			var defaults = arguments[0];
                        options.path = defaults.url;
                        options.method = defaults.method;
                        var request = client.request(options, function(response){
				_private.cookies.parse(response.headers['set-cookie']);
                                response.setEncoding('utf8');
                                response.on('data', defaults.success);
                        });
                        request.on('error', function(error){
                                defaults.error(error);
                        });
			return request;
                },
		header: function(){
			options.header[arguments[0]] = arguments[1];
			return this;
		}
	}
};
