import chalk from 'chalk';

import fsh from '../extensions/fs';
import log from '../extensions/log';

export default async function renderPosts(renderer, settings, posts) {
	log('LOG', `Rendering ${posts.length} post${posts.length === 1 ? '' : 's'}`);

	for (var i = 0, l = posts.length; i < l; i++) {
		const post = posts[i];

		let next, prev;

		if (( i + 1 ) < l) {
			next = posts[i + 1];
		}

		if (i > 0) {
			prev = posts[i - 1];
		}

		const data = Object.assign({}, post, { next, prev, metaDescription: post.description }),
			html = renderer.render(settings.postTemplate, data);

		await fsh.mkdirp(post.destPath);

		await fsh.writeFile(post.destFile, html);

		log('POST', `Written ${chalk.cyan(post.title)}`);
	}
}
