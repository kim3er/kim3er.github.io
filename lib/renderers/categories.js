import chalk from 'chalk';

import fsh from '../extensions/fs';
import log from '../extensions/log';

export default 	async function renderCategories(renderer, settings, categories) {
	for (const [name, category] of categories.entries()) {
		log('CATEGORY', `${chalk.cyan(name)}`);

		for (const year of category.years) {
			log('CATEGORY', `- ${chalk.cyan(year.name)}, ${chalk.cyan(year.posts.length)}`);
		}

		const html = renderer.render('category.html', category);

		await fsh.mkdirp(category.path);
		await fsh.writeFile(category.file, html);

		log('CATEGORY', '---------');
	}
}
