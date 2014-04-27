var assert = require("assert");

describe('storage', function(){
	describe('#db()', function(){
		it('should return a valid database connection object', function(){
			var storage = require('../utilities/storage.js');
			var settings = require('../settings.json');
			storage.db(settings).open(function(error, db){
				assert.equal('object', typeof db);
				var test = db.collection("test");
				assert.equal("function", typeof test.insert);
				assert.equal("function", typeof test.find);
				assert.equal("function", typeof test.remove);
				assert.equal("function", typeof test.save);
			});
		});
	});
});
