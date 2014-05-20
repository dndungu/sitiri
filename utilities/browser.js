"use strict"
var querystring = require('querystring');
var fs = require('fs');
var zlib = require("zlib");
var stream = require('stream');
var cookies = require('../utilities/cookies.js');
module.exports = function(){

	var client;

	var options = {
		headers: {},
		hostname: 'localhost',
		port: 8080,
		encoding: 'utf8',
		rejectUnauthorized: false,
		secure: true
	}

	var _private = {
		cookies: new cookies(),
		store: {headers: {}},
		request: function(){
				var args = arguments[0];
				options.path = args.url;
				options.method = args.method;
				var cookieString = _private.cookies.toCookieString();
				cookieString.length && (options.headers['cookie'] = cookieString);
				var request = client.request(options, function(response){
						_private.cookies.parse(response.headers);
						var redirect = response.headers['location'];
						redirect && _private.redirect(args);
						if(redirect) return;
						var buffer = [];
						var reader = new stream.Duplex();
						var encoding = response.headers['content-encoding'];
						var writer = encoding == "gzip" ? response.pipe(zlib.createGunzip()) : (encoding == "deflate" ? response.pipe(zlib.createDeflate()) : response);
						writer
						.on('data', function(){
								var data = arguments[0].toString();
								buffer.push(data);
								args.data && args.data(data);
						})
						.on('end', function(){
								_private.store.headers = response.headers;
								_private.cookies.parse(_private.store.headers);
								args.end && args.end(buffer.join(""));
						})
						.on('error', function(){
								args.error && args.error(arguments[0]);
						});
				});
				request.on('error', function(){
						args.error && args.error(arguments[0]);
				});
				return request;
		},
		redirect: function(args){
				delete options.headers['content-length'];
				delete options.headers['content-type'];
				args.url = _private.store.headers['location'];
				var request = _private.request(args);
				request.end();
				return;
		}
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
			var data = querystring.stringify(args.form);
			options.headers['content-type'] = 'application/x-www-form-urlencoded';
			options.headers['content-length'] = Buffer.byteLength(data,'utf8');
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
		getHeader: function(){
				var key = arguments[0];
				return _private.store.headers.hasOwnProperty(key) ? _private.store.headers[key] : null;
		},
		getAllHeaders: function(){
				return _private.store.headers;
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
