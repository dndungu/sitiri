var querystring = require('querystring');
var fs = require('fs');
var cookies = require('../utilities/cookies.js');
module.exports = function(){

	var client;

	var options = {
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
		get: function(url, callback){
			var request = this.request('GET', url, callback);
			request.end();
			return this;
		},
		post: function(url, data, callback){
			data = querystring.stringify(data);
			options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			options.headers['Content.length'] = Buffer.byteLength(data,'utf8');
			var request = this.request('POST', url, callback);
			request.write(data);
			request.end();
			return this;
		},
		put: function(url, filename, callback){		
			options.headers['Content-Type'] = 'multipart/form-data';
			options.headers['Content.length'] = 0;
			var stream = fs.createReadStream(filename);
			var request = this.request('PUT', url, callback);
			stream.on('data', function(data){
				options.headers['Content.length'] += data.length;
				request.write(data);
			});
			stream.on('end', function(){
				request.end();
			});
			return this;
		},
		"delete": function(url, callback){
			var request = this.request('DELETE', url, callback);
			request.end();
			return this;
		},
                request: function(method, url, callback){
                        options.path = url;
                        options.method = method;
                        var request = client.request(options, function(response){
				_private.cookies.parse(response.headers['set-cookie']);
                                response.setEncoding('utf8');
                                response.on('data', callback);
                        });
                        request.on('error', function(error){
                                console.log(error);
                        });
			return request;
                },
		header: function(){
			options.header[arguments[0]] = arguments[1];
			return this;
		}
	}
};
