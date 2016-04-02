require('babel-register');
require('../lib/build').default();

process.on('unhandledRejection', function(reason, p) {
	console.log(reason);
});
