import 'babel-polyfill';

import path from 'path';

import chalk from 'chalk';
import marked from 'marked';

import fsh from './extensions/fs';
import log from './extensions/log';

import Renderer from './components/renderer';

import grabPostData from './parsers/posts';

import getSettings from './settings';

export default async function init() {
	const settings = await getSettings();

	const postsSrcPath = `${settings.srcPath}/posts`;

	const renderer = new Renderer(settings, path.resolve('.')),
		render = renderer.render.bind(renderer);

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
				html = render(settings.postTemplate, fileData);

			await fsh.mkdirp(data.attributes.destPath);

			await fsh.writeFile(data.attributes.destFile, html);

			log('POST', `Written ${chalk.cyan(data.attributes.title)}`);
		}
	};

	async function renderArchive(postsByYear, postCount) {
		const archiveHtml = render('archive.html', { postsByYear });

		await fsh.writeFile(`${settings.buildPath}/blog/archive.html`, archiveHtml);

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

			const html = render('index.html', {
				postsByYear: slice,
				prev: ( idx > 1 ? ( idx === 2 ? '/' : `/posts/${idx - 1}` ) : null ),
				next: ( idx < slices.length ? `/posts/${idx + 1}` : null )
			});

			await fsh.mkdirp(path);
			await fsh.writeFile(file, html);

			log('ARCHIVE', `Written page ${chalk.cyan(idx)} of ${chalk.cyan(slices.length)}`);
		}
	}

	async function renderCategories(categories) {
		for (const [key, value] of categories.entries()) {
			log('CATEGORY', `${chalk.cyan(key)}`);

			for (const data of value.years) {
				log('CATEGORY', `- ${chalk.cyan(data.name)}, ${chalk.cyan(data.posts.length)}`);
			}

			const html = render('category.html', value);

			await fsh.mkdirp(value.path);
			await fsh.writeFile(value.file, html);

			log('CATEGORY', '---------');
		}
	}

	async function buildTemplates() {
		await fsh.rimraf(settings.buildPath);

		const { postsByYear, categories, postCount } = await grabPostData(postsSrcPath, settings, renderer);

		for (const year of postsByYear) {
			await renderPosts(year.posts);
		}

		await renderArchive(postsByYear), postCount;
		await renderCategories(categories);
	};

	await buildTemplates();
};
