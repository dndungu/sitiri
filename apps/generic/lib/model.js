"use strict"
var fs = require('fs');
var querystring = require('querystring');
var _private = {
	model: null,
	definition: null,
	fields: null,	
	options: null,
	load: function(model){
		var home = _private.options.context.get('site').home;
		var filename = '../../../sites/' + home + '/models/' + model;
		return require(filename);
	},
	required: function(validation){
		return (validation.indexOf('required') != -1);
	},
	rules: function(validation){
		if(!validation) return false;
			for(var i in validation){
				'required' == validation[i] ? validation.splice(i, 1) : null;
		}
		return validation;
	},
	inherit: function(){
		var model = arguments[0];
		var definition = _private.load(model);
		if(!definition.inherits) return definition.fields;
		for(var i in definition.inherits){
			var fields = _private.inherit(definition.inherits[i]);
			var j = new Number(fields.length);
			while(j--){
				for(var k in definition.fields){
					if(definition.fields[k].name == fields[j].name) continue;
					definition.fields.unshift(fields[j]);
					break;
				}
			}
		}
		return definition.fields;
	},
	embed: function(fields){
		for(var i in fields){
			var field = fields[i];
			if(!field.model) continue;
			var childrenFields = _private.inherit(field.model);
			fields[i].fields = _private.embed(childrenFields);
		}
		return fields;
	},
	parse: function(){
		var callback = arguments[0];
		var request = _private.options.context.get('request');
		var buffer = [];
		request.on('data', function(chunk){
			buffer.push(chunk.toString());
		});
		request.on('end', function(){
				var data = request.headers['content-type'] == "application/json" ? JSON.parse(buffer.join()) : querystring.parse(buffer.join());
				callback(data);
		});
		return this;
	},


};
module.exports = function() {
	return {
			broker: null,
			init: function(){
				_private.options = arguments[0];
				_private.model = _private.options.context.get('route').parameters.model;
        		_private.definition = _private.load(_private.model);
			},
			parse: function(){
				var that = this;
				_private.definition.fields = _private.embed(_private.inherit(_private.model));
				_private.parse(function(data){
					that.broker.emit({"type": "data.received", data: data});
				});
			},
			sanitize: function(){
				var data = arguments[0];
				var fields = model.getFields();
				var filtered = model.filter(data, fields);
				var generated = model.generate(filtered, fields);
				if(!model.validate(generated, fields)) throw new Error('Sorry mate validation has failed');
				return model.authorize(generated, fields);
			},
			insert: function(){
				var item = arguments[0];
				var name = _private.definition.name;
				var collection = _private.options.context.get('storage').get('global').collection(name);
				collection.insert(item, {safe: true}, function(error, records){
					error && _private.options.context.log(1, error);
					error && _private.options.statusCode(500);
					error && _private.options.error({type: "internal_server_error", message: "Error while trying insert the document you sent."});
					error || _private.options.data({_id: records[0]._id});
					_private.options.end();
				});
			},
			update: function(){
				var _id = arguments[0];
				var document = arguments[1];
				var name = _private.definition.name;
				var collection = _private.options.context.get('storage').get('global').collection(name);
				this.audit(_id, function(){
					collection.update({"_id": _id}, {$set: document},{safe: true},function(error, updated){
						error && _private.options.context.log(1, error);
						error && _private.options.statusCode(500);
						error && _private.options.error({type: "internal_server_error", message: "Error while trying update the document you sent."});
						error || _private.options.data({"updated" : updated});
						_private.options.end();
					});
				});
			},
			audit: function(){
				var _id = arguments[0];
				var callback = arguments[1];
				var name = _private.definition.name;
				var collection = _private.options.context.get('storage').get('global').collection(name);
				collection.find({"_id": _id}).toArray(function(error, items){
					items[0]._pid = items[0]._id;
					items[0]._id = _private.options.context.get('storage').uuid();
					var audit = _private.options.context.get('storage').get('global').collection(name + "_audit");
					items.length && audit.insert(items, {safe: true}, function(error, records){
						callback();
					});
				});
			},
			find: function(){
				var _id = arguments[0];
				var name = _private.definition.name;
				var collection = _private.options.context.get('storage').get('global').collection(name);
				collection.find({"_id": _id}).toArray(function(error, items){
					error && _private.options.context.log(1, error);
					error && _private.options.error(error);
					items.length || _private.options.statusCode(404);
					items.length || _private.options.error({error: {type: "invalid_request_error", message: ("No such " + name), param: {"_id": _id}}});
					items.length && _private.options.data(items);
					_private.options.end();
				});
			},
			remove: function(){
				var _id = arguments[0];
				var name = _private.definition.name;
				var collection = _private.options.context.get('storage').get('global').collection(name);
				this.audit(_id, function(){
					collection.remove({"_id": _id}, function(error, affected){
						error && _private.options.context.log(1, error);
						error && _private.options.error(error);
						affected || _private.options.statusCode(404);
						affected || _private.options.data({error: {type: "invalid_request_error", message: ("No such " + name), param: {"_id": _id}}});
						affected && _private.options.data({deleted: true, _id: _id});
						_private.options.end();
					});
				});
			},
			filter: function(){
				var post = arguments[0];
				var fields = arguments[1];
				var result = {};
				for(var i in fields){
					var field = fields[i];
					var name = field.name;
					var children = (field.fields && post[name]) ? this.filter(post[name], field.fields) : null;
					children && (result[name] = children);
					post[name] != undefined ? (result[name] = post[name]) : null;
				}
				return result;
			},
			authorize: function(){
				return arguments[0];
			},
			generate: function(){
				var post = arguments[0] ? arguments[0] : {};
				var fields = arguments[1];
				for(var i in fields){
					var field = fields[i];
					var name = field.name;
					if(name == "_id" && _private.options.operation == "update") continue;
					var type = field.type;
					if(!post[name] && field._default != undefined) {post[name] = field._default; continue};
					var item = (post[name] == undefined) ? (field.type.indexOf('.collection') == -1 ? {} : []) : post[name];
					var children = field.fields ? this.generate(item, field.fields) : null;
					children ? (post[name] = children) : null;
					if(!field.generate || field.generate.operation != _private.options.operation) continue;
					var overwrite = !post[name] ? true : (field.generate.overwrite === false ? false : true);
					var storage = _private.options.context.get('storage');
					field.generate.type == "uuid" && overwrite ? (post[name] = storage.uuid()) : null;
					field.generate.type == "timestamp" && overwrite ? (post[name] = storage.timestamp()) : null;
				}
				return post;
			},
			validate: function(){
				var post = arguments[0];
				var fields = arguments[1];
				var validator = require('../lib/validator.js');
				for(var i in fields){
					var field = fields[i];
					var name = field.name;
					if(name == "_id" && _private.options.operation == "update") continue;
					var type = field.type;
					var required = (field.validation && _private.required(field.validation)) ? true : false;
					if(!required) continue;
					var rules = _private.rules(field.validation);
					if(post[name] && field.fields){
						var valid = this.validate(post[name], field.fields);
						if(required && !valid) return false;
					}
					for(var j in rules){
						if(field.type.indexOf('.collection') != -1) {
							for(var k in post[name]){
								if(required && !validator.test(rules[j], post[name][k])) return false;
							}
						}else{
							var valid = validator.test(rules[j], post[name]);
							if(required && !valid) return false;
						}
					}
				}
				return true;
			},
			getFields: function(){
				return _private.definition.fields;
			}
	}
};
