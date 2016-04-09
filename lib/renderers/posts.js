import chalk from 'chalk';
import marked from 'marked';

import fsh from '../extensions/fs';
import log from '../extensions/log';

export default async function renderPosts(renderer, settings, posts) {
	log('LOG', `Rendering ${posts.length} post${posts.length === 1 ? '' : 's'}`);

	for (var i = 0, l = posts.length; i < l; i++) {
		const data = posts[i],
			contents = marked(data.body);

		let next, prev;

		if (( i + 1 ) < l) {
			next = posts[i + 1].attributes;
		}

		if (i > 0) {
			prev = posts[i - 1].attributes;
		}

		const fileData = Object.assign({}, data.attributes, { contents, next, prev }),
			html = renderer.render(settings.postTemplate, fileData);

		await fsh.mkdirp(data.attributes.destPath);

		await fsh.writeFile(data.attributes.destFile, html);

		log('POST', `Written ${chalk.cyan(data.attributes.title)}`);
	}
}
