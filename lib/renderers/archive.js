import chalk from 'chalk';

import fsh from '../extensions/fs';
import log from '../extensions/log';

export default async function renderArchive(renderer, settings, postsByYear, postCount) {
	const archiveHtml = renderer.render('archive.html', { postsByYear });

	await fsh.mkdirp(`${settings.buildPath}/blog/archives`);

	await fsh.writeFile(`${settings.buildPath}/blog/archives/index.html`, archiveHtml);

	const postsPerPage = 10,
		pagesOfPosts = Math.ceil(postCount / postsPerPage);

	const slices = [];

	let idx = 0,
		currentYear;
	for (const year of postsByYear) {
		for (const post of year.posts) {
			const page = parseInt(idx / postsPerPage),
				pageIdx = idx - (page * postsPerPage);

			if (pageIdx === 0) {
				slices.push([]);
			}

			const currentSlice = slices[slices.length - 1];

			if (year.name !== currentYear || !currentSlice.length) {
				currentSlice.push({
					name: year.name,
					posts: []
				});

				currentYear = year.name;
			}

			currentSlice[currentSlice.length - 1].posts.push(post);

			idx++;
		}
	}

	for (let i = 0, l = slices.length; i < l; i++) {
		const slice = slices[i],
			idx = i + 1;

		const url = idx > 1 ? `/posts/${idx}` : '',
			path = `${settings.buildPath}${url}`,
			file = `${path}/${settings.indexFile}`;

		const html = renderer.render('index.html', {
			postsByYear: slice,
			prev: ( idx > 1 ? ( idx === 2 ? '/' : `/posts/${idx - 1}` ) : null ),
			next: ( idx < slices.length ? `/posts/${idx + 1}` : null )
		});

		await fsh.mkdirp(path);
		await fsh.writeFile(file, html);

		log('ARCHIVE', `Written page ${chalk.cyan(idx)} of ${chalk.cyan(slices.length)}`);
	}
}
