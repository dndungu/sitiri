var should = require('should');
var browser = require('../utilities/browser.js');
describe('image', function(){
	describe('#put()', function(){
		it('The server should receive and persist an image sent using PUT method and send a response with the _id of the image', function(){
			var tab = new browser({
				hostname: 'localhost',
				port: 443,
				secure: true
			});
			tab.put({
				url: '/api/images',
				filename: 'test/images/handbag.jpg',
				end: function(){
					var response = JSON.parse(arguments[0]);
					response.should.have.property('_id').with.lengthOf(36);
				},
				error: function(error){
					console.log(error);
					should.not.exist(error);
				}
			});
		});
	});
});
