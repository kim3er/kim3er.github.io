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

function sortStringsAsNumberReverse(a, b) {
	a = Number(a);
	b = Number(b);

	if (a > b)
	   return -1;
	if (a < b)
	  return 1;
	return 0;
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
			postsByYearObj = {},
			categoryObj = {};

		let postCount = 0;

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

			data.excerpt = marked(data.body.split(/\<\!\-\-[\s]*more[\s]*\-\-\>/i)[0]);

			if ('published' in data.attributes && data.attributes.published === false) {
				continue;
			}

			data.attributes.url = nunjucks.renderString(settings.postUrl, { year, month, day, fileName });
			data.attributes.destPath = `${settings.buildPath}${data.attributes.url}`;
			data.attributes.destFile = `${data.attributes.destPath}/${indexFile}`;

			if (data.attributes.categories) {
				for (let i = 0, l = data.attributes.categories.length; i < l; i++) {
					const name = data.attributes.categories[i],
						slug = name.toString().toLowerCase().trim()
							.replace(/\s+/g, '-')           // Replace spaces with -
							.replace(/&/g, '-and-')         // Replace & with 'and'
							.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
							.replace(/\-\-+/g, '-'),        // Replace multiple - with single -
						url = `/blog/categories/${slug}`,
						path = `${settings.buildPath}${url}`,
						file = `${path}/${indexFile}`;

					data.attributes.categories[i] = {
						name, url, path, file
					};
				}

				for (const category of data.attributes.categories) {
					if (!categoryObj[category.name]) {
						categoryObj[category.name] = Object.assign({}, category, { years: {} });
					}

					if (!categoryObj[category.name].years[year]) {
						categoryObj[category.name].years[year] = [];
					}

					categoryObj[category.name].years[year].push({
						title: data.attributes.title,
						url: data.attributes.url,
						categories: data.attributes.categories
					});
				}
			}

			log('POST', `Found ${chalk.cyan(data.attributes.title)}`);

			if (!postsByYearObj[year]) {
				postsByYearObj[year] = [];
			}

			postsByYearObj[year].push(data);

			postCount++;
		}

		const postsByYear = [];

		for (const year in postsByYearObj) {
			postsByYear.push({
				name: year,
				posts: postsByYearObj[year].reverse()
			});
		}

		postsByYear.sort(function(a, b) {
			return sortStringsAsNumberReverse(a.name, b.name);
		});

		const categories = new Map();
		const categoryKeys = Object.keys(categoryObj).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

		for (const key of categoryKeys) {
			const years = [];

			const yearKeys = Object.keys(categoryObj[key].years).sort(sortStringsAsNumberReverse);

			for (const year of yearKeys) {
				const yearObj = {
					name: year,
					posts: categoryObj[key].years[year].sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
				};

				years.push(yearObj);
			}

			categories.set(key, {
				years,
				name: categoryObj[key].name,
				url: categoryObj[key].url,
				path: categoryObj[key].path,
				file: categoryObj[key].file
			});
		}

		log('POST', `${chalk.cyan(postCount)} found.`);

		return { postsByYear, categories, postCount };
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

	async function renderArchive(postsByYear, postCount) {
		const archiveHtml = nunjucksWithLayout.render('archive.html', { postsByYear });

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
				file = `${path}/${indexFile}`;

			const html = nunjucksWithLayout.render('index.html', {
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

			const html = nunjucksWithLayout.render('category.html', value);

			await fsh.mkdirp(value.path);
			await fsh.writeFile(value.file, html);

			log('CATEGORY', '---------');
		}
	}

	async function buildTemplates() {
		await fsh.rimraf(settings.buildPath);

		const { postsByYear, categories, postCount } = await grabPostData();

		for (const year of postsByYear) {
			await renderPosts(year.posts);
		}

		await renderArchive(postsByYear), postCount;
		await renderCategories(categories);
	};

	await buildTemplates();
};
