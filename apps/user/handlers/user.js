module.exports = {
		doGet: function(){
				var args = arguments[0];
				args.data({action : 'to find users'});
				args.end();
		},
		doPost: function(){
				var args = arguments[0];
				args.data({action : 'to register users'});
				args.end();
		},
		doPut: function(){
				var args = arguments[0];
				args.data({action: 'to upload files'});
				args.end();
		},
		doDelete: function(){
                var args = arguments[0];
                args.data({action: 'to delete files'});
                args.end();				
		}

};
