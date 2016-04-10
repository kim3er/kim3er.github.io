require('babel-register');
require('../lib/serve').default();

process.on('unhandledRejection', function(reason, p) {
	console.log(reason);
});
