export default function serve() {
	const bs = require('browser-sync').create();

	bs.watch('*.html').on('change', bs.reload);

	bs.watch('css/*.css', function (event, file) {
    if (event === 'change') {
      bs.reload('*.css');
    }
	});

	bs.init({
		server: './.build',
		open: false
	});
}
