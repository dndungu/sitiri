//var assert = require('assert');

var browser = require('../utilities/browser.js');

//describe('image', function(){
//	describe('#put()', function(){
//		it('The server should receive and persist an image sent using PUT method and send a response with the _id of the image', function(){
			var tab = new browser({
				hostname: 'localhost',
				port: 8080,
				secure: false
			});
			tab.put({
				url: '/api/images',
				filename: 'test/images/handbag.jpg',
				success: function(response){
					console.log(response);
					response = JSON.parse(response);
//					assert.equal(36, response.content.image._id.length);
				},
				error: function(error){
//					assert.equal('undefined', typeof error);
				}
			});
//		});
//	});
//	describe('#delete()', function(){
//		it('', function(){
//			
//		});
//	});
///});
