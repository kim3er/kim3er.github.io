import chalk from 'chalk';
import fm from 'front-matter';
import marked from 'marked';

import { sortStringsAsNumberReverse } from '../extensions/array';
import fsh from '../extensions/fs';
import log from '../extensions/log';

export default async function posts(path, settings, renderer) {
	const files = await fsh.readdir(path),
		postsByYearObj = {},
		categoryObj = {};

	let postCount = 0;

	for (const file of files) {
		const matches = file.match(/^([\d]{4})\-([\d]{2})\-([\d]{2})\-([\w\d\-]+)\.(markdown|md)$/);

		if (!matches) {
			continue;
		}

		const year = matches[1],
			month = matches[2],
			day = matches[3],
			fileName = matches[4];

		const body = await fsh.readFile(`${path}/${file}`),
			data = fm(String(body));

		data.excerpt = marked(data.body.split(/<!--[\s]*more[\s]*-->/i)[0]);

		if ('published' in data.attributes && data.attributes.published === false) {
			continue;
		}

		data.attributes.url = renderer.renderString(settings.postUrl, { year, month, day, fileName });
		data.attributes.destPath = `${settings.buildPath}${data.attributes.url}`;
		data.attributes.destFile = `${data.attributes.destPath}/${settings.indexFile}`;

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
					file = `${path}/${settings.indexFile}`;

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
					date: data.attributes.date,
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
}
