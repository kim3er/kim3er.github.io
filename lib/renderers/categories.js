import chalk from 'chalk';

import fsh from '../extensions/fs';
import log from '../extensions/log';

export default 	async function renderCategories(renderer, settings, categories) {
	for (const [key, value] of categories.entries()) {
		log('CATEGORY', `${chalk.cyan(key)}`);

		for (const data of value.years) {
			log('CATEGORY', `- ${chalk.cyan(data.name)}, ${chalk.cyan(data.posts.length)}`);
		}

		const html = renderer.render('category.html', value);

		await fsh.mkdirp(value.path);
		await fsh.writeFile(value.file, html);

		log('CATEGORY', '---------');
	}
}
