"use strict"
var http = require('http');
var router = require("../core/router.js");
var authenticator = require("../core/authenticator.js");
var cache = require("../core/cache.js");
var operator = require("../core/operator.js");
var publisher = require("../core/publisher.js");
var storage = require('../utilities/storage.js');
var broker = require('../utilities/broker.js');
var cookies = require('../utilities/cookies.js');
var context = require('../utilities/context.js');

var _private = {
	createServer: function(settings){
		http.createServer(function(request, response){
			var host = request.headers.host.split(':')[0];
			var uri = String(request.url.trim()).toLowerCase();
			console.log(request.url)
			var requestContext = new context();
			var contextBroker = new broker();
			var contextCookies = new cookies(request.headers);
			requestContext.set("cookies", contextCookies);
			requestContext.set("request", request);
			requestContext.set("response", response);
			requestContext.set("host", host);
			requestContext.set("method", request.method);
			requestContext.set("uri", uri);
			requestContext.set("url", request.url);
			requestContext.set("storage", storage);
			requestContext.set("settings", settings);
			requestContext.set("broker", contextBroker);
			router.init(requestContext);
			authenticator.init(requestContext);
			cache.init(requestContext);
			operator.init(requestContext);
			publisher.init(requestContext);
			requestContext.get("broker").emit({type : 'controller.passed', data : requestContext});
		}).listen(settings.server.port, settings.server.host);		
	}
};

module.exports = {
	listen: function(settings){
		storage.db(settings).open(function(error, db){
			if(error){
				console.log(error);
				return
			}
			storage.set("global", db);
			_private.createServer(settings);
		});
	}
};
