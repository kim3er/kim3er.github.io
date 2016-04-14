require('babel-register');
require('../lib/publish').default();

process.on('unhandledRejection', function(reason, p) {
	console.log(reason);
});
