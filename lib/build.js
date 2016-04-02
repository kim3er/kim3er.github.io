import 'babel-polyfill';

import chalk from 'chalk';
import fm from 'front-matter';
import marked from 'marked';
import moment from 'moment';
import nunjucks from 'nunjucks';

import fsh from './fs_helpers';
import getSettings from './settings';

function log(step, message) {
	console.log(`${chalk.bold.magenta(step)} ${message}`);
}

export default async function init() {
	const settings = await getSettings(__dirname);

	const postsSrcPath = `${settings.srcPath}/posts`,
		layoutsSrcPath = `${settings.srcPath}/layouts`;

	const indexFile = 'index.html',
		postRegex = /^([\d]{4})\-([\d]{2})\-([\d]{2})\-([\w\d\-]+)\.(markdown|md)$/;

	const nunjucksWithLayout = new nunjucks.Environment(new nunjucks.FileSystemLoader(layoutsSrcPath));

	async function grabPostData() {
		const files = await fsh.readdir(postsSrcPath),
			posts = [],
			categoryObj = {};

		for (const file of files) {
			const matches = file.match(postRegex);

			if (!matches) {
				continue;
			}

			const year = matches[1],
				month = matches[2],
				day = matches[3],
				fileName = matches[4];

			const body = await fsh.readFile(`${postsSrcPath}/${file}`),
				data = fm(String(body));

			if ('published' in data.attributes && data.attributes.published === false) {
				continue;
			}

			data.attributes.url = nunjucks.renderString(settings.postUrl, { year, month, day, fileName });
			data.attributes.destPath = `${settings.buildPath}${data.attributes.url}`;
			data.attributes.destFile = `${data.attributes.destPath}/${indexFile}`;

			if (data.attributes.categories) {
				console.log('cat')
				for (const category of data.attributes.categories) {
					if (!categoryObj[category]) {
						categoryObj[category] = [];
					}

					categoryObj[category].push({
						title: data.attributes.title,
						url: data.attributes.url
					});
				}
			}

			log('POST', `Found ${chalk.cyan(data.attributes.title)}`);

			posts.push(data);
		}

		posts.reverse();

		const categories = new Map();
		// try {

		// console.log(Object.keys(categoryObj).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())))
		// }
		// catch(e) {
		// 	console.log(e)
		// }
		// console.log('test')

		const categoryKeys = Object.keys(categoryObj).sort();
		console.log(categoryKeys)
		console.log('test')
		for (const key in categoryKeys) {
			console.log(key)
			categories.set(key, categoryObj[key].sort((a, b) => a.title.localeCompare(b.title)));
		}

		return { posts, categories };
	};

	async function renderPosts(posts) {
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
				html = nunjucksWithLayout.render(settings.postTemplate, fileData);

			await fsh.mkdirp(data.attributes.destPath);

			await fsh.writeFile(data.attributes.destFile, html);

			log('POST', `Written ${chalk.cyan(data.attributes.title)}`);
		}
	};

	async function buildTemplates() {
		await fsh.rimraf(settings.buildPath);

		const { posts, categories } = await grabPostData();

		console.log(categories);

		await renderPosts(posts);

		// Render Archive
		const archiveHtml = nunjucksWithLayout.render('archive.html', { posts: posts });

		await fsh.writeFile(`${settings.buildPath}/blog/archive.html`, archiveHtml);

		const totalPosts = posts.length,
			postsPerPage = 10,
			pagesOfPosts = Math.ceil(totalPosts / postsPerPage);

		let i = 0;
		while (i < pagesOfPosts) {
			const start = i++ * postsPerPage,
				remaining = totalPosts - start,
				end = start + ( remaining > postsPerPage ? postsPerPage : remaining );

			const url = i > 1 ? `/posts/${i}` : '',
				path = `${settings.buildPath}${url}`,
				file = `${path}/${indexFile}`;

			const html = nunjucksWithLayout.render('index.html', {
				posts: posts.slice(start, end),
				prev: ( i > 1 ? `/posts/${i - 1}` : null ),
				next: ( i < pagesOfPosts ? `/posts/${i + 1}` : null )
			});

			await fsh.mkdirp(path);

			await fsh.writeFile(file, html);
		}
	};

	await buildTemplates();
};
