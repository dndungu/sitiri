var querystring = require('querystring');
var fs = require('fs');
var cookies = require('../utilities/cookies.js');
module.exports = function(){

	var client;

	var options = {
		headers: {},
		hostname: 'localhost',
		port: 8080,
		encoding: 'utf8',
		secure: true
	}

	var _private = {
		cookies: new cookies(),
		store: {},
		request: function(){
				var args = arguments[0];
				options.path = args.url;
				options.method = args.method;
				options.cert && (options.cert = fs.readFileSync(options.cert, options.encoding));
				options.key && (options.key = fs.readFileSync(options.key, options.encoding));
				var cookieString = _private.cookies.toString();
				cookieString.length && (options.headers['Cookie'] = _private.cookies.toString());
				var request = client.request(options, function(response){
						_private.cookies.parse(response.headers);
						response.setEncoding(options.encoding);
						response.on('data', args.data);
						response.on('end', args.end);
				});
				request.on('error', args.error);
				return request;
		},
	}

	var parameters = arguments[0];

	for ( var i in parameters) {
		options[i] = parameters[i];
	}

	client = options.secure ? require('https') : require('http');

	return {
		get: function(){
			var args = arguments[0];
			args.method = 'GET';
			var request = _private.request(args);
			request.end();
			return this;
		},
		post: function(){
			var args = arguments[0];
			args.method = 'POST';
			data = querystring.stringify(data);
			options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			options.headers['Content.length'] = Buffer.byteLength(data,'utf8');
			var request = _private.request(args);
			request.write(data);
			request.end();
			return this;
		},
		put: function(){
			var args = arguments[0];
			args.method = 'PUT';
			options.headers['content-type'] = 'multipart/form-data';
			options.headers['content-length'] = fs.statSync(args.filename).size;
			var stream = fs.createReadStream(args.filename);
			var request = _private.request(args);
			stream.on('data', function(data){
				request.write(data);
			});
			stream.on('end', function(){
				request.end();
			});
			return this;
		},
		"delete": function(){
			var args = arguments[0];
			args.method = 'DELETE';
			var request = _private.request(args);
			request.end();
			return this;
		},
		setHeader: function(){
			options.headers[arguments[0]] = arguments[1];
			return this;
		},
		setOption: function(){
			options[arguments[0]] = arguments[1];
			return this;
		}
	}
};
