require('babel-register');
require('../lib/post').default();

process.on('unhandledRejection', function(reason, p) {
	console.log(reason);
});
