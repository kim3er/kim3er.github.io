import chalk from 'chalk';
import fm from 'front-matter';
import marked from 'marked';
import striptags from 'striptags';

import { sortStringsAsNumberReverse } from '../extensions/array';
import fsh from '../extensions/fs';
import log from '../extensions/log';

function categoryObjToMap(obj) {
	const categories = new Map();
	const categoryKeys = Object.keys(obj).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

	for (const key of categoryKeys) {
		const years = [];

		const yearKeys = Object.keys(obj[key].years).sort(sortStringsAsNumberReverse);

		for (const year of yearKeys) {
			const yearObj = {
				name: year,
				posts: obj[key].years[year].sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
			};

			years.push(yearObj);
		}

		const category = Object.assign({}, obj[key], { years });

		categories.set(key, category);
	}

	return categories;
}

function postsByYearObjToArray(obj) {
	const postsByYear = [];

	for (const year in obj) {
		postsByYear.push({
			name: year,
			posts: obj[year].reverse()
		});
	}

	postsByYear.sort(function(a, b) {
		return sortStringsAsNumberReverse(a.name, b.name);
	});

	return postsByYear;
}

export default async function posts(path, settings, renderer) {
	const files = await fsh.readdir(path),
		postsByYearObj = {},
		categoryObj = {};

	let postCount = 0;

	for (const file of files) {
		const matches = file.match(/^([\d]{4})\-([\d]{2})\-([\d]{2})\-([\w\d\-]+)\.(markdown|md|mdown)$/);

		if (!matches) {
			continue;
		}

		const body = await fsh.readFile(`${path}/${file}`),
			data = fm(String(body));

		if ('published' in data.attributes && data.attributes.published === false) {
			continue;
		}

		const post = Object.assign({}, data.attributes, { categories: [] });

		post.body = marked(data.body);
		post.excerpt = marked(data.body.split(/<!--[\s]*more[\s]*-->/i)[0]);
		post.description = striptags(post.excerpt);

		const year = matches[1],
			month = matches[2],
			day = matches[3],
			fileName = matches[4];

		post.url = renderer.renderString(settings.postUrl, { year, month, day, fileName });
		post.destPath = `${settings.buildPath}${post.url}`;
		post.destFile = `${post.destPath}/${settings.indexFile}`;

		if (data.attributes.categories) {
			for (const name of data.attributes.categories) {
				const slug = name.toString().toLowerCase().trim()
						.replace(/\s+/g, '-')           // Replace spaces with -
						.replace(/&/g, '-and-')         // Replace & with 'and'
						.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
						.replace(/\-\-+/g, '-'),        // Replace multiple - with single -
					url = `/blog/categories/${slug}`,
					path = `${settings.buildPath}${url}`,
					file = `${path}/${settings.indexFile}`;

				const category = {
					name, url, path, file
				};

				post.categories.push(category);

				if (!categoryObj[category.name]) {
					categoryObj[category.name] = Object.assign({}, category, { years: {} });
				}

				if (!categoryObj[category.name].years[year]) {
					categoryObj[category.name].years[year] = [];
				}

				categoryObj[category.name].years[year].push(post);
			}
		}

		log('POST', `Found ${chalk.cyan(post.title)}`);

		if (!postsByYearObj[year]) {
			postsByYearObj[year] = [];
		}

		postsByYearObj[year].push(post);

		postCount++;
	}

	const postsByYear = postsByYearObjToArray(postsByYearObj),
		categories = categoryObjToMap(categoryObj);

	log('POST', `${chalk.cyan(postCount)} found.`);

	return { postsByYear, categories, postCount };
}
