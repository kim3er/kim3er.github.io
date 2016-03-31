import 'babel-polyfill';

import fm from 'front-matter';
import gulp from 'gulp';
import marked from 'marked';
import moment from 'moment';
import nunjucks from 'nunjucks';

import fsh from './lib/fs_helpers';
import getSettings from './lib/settings';

const init = async function() {
	const settings = await getSettings(__dirname);

	const postsSrcPath = `${settings.srcPath}/posts`,
		layoutsSrcPath = `${settings.srcPath}/layouts`;

	const indexFile = 'index.html',
		postRegex = /^([\d]{4})\-([\d]{2})\-([\d]{2})\-([\w\d\-]+)\.(markdown|md)$/;

	const nunjucksWithLayout = new nunjucks.Environment(new nunjucks.FileSystemLoader(layoutsSrcPath));

	const grabPostData = async function() {
		const files = await fsh.readdir(postsSrcPath),
			fileArr = [];

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

			fileArr.push(data);
		}

		fileArr.reverse();

		return fileArr;
	};

	const renderPosts = async function(postData) {
		for (var i = 0, l = postData.length; i < l; i++) {
			const data = postData[i],
				contents = marked(data.body);

			let next, prev;

			if (( i + 1 ) < l) {
				next = postData[i + 1].attributes;
			}

			if (i > 0) {
				prev = postData[i - 1].attributes;
			}

			const fileData = Object.assign({}, data.attributes, { contents, next, prev }),
				html = nunjucksWithLayout.render(settings.postTemplate, fileData);

			await fsh.mkdirp(data.attributes.destPath);

			await fsh.writeFile(data.attributes.destFile, html);
		}
	};

	const buildTemplates = async function() {
		await fsh.rimraf(settings.buildPath);

		const postData = await grabPostData();

		await renderPosts(postData);

		// Render Archive
		const archiveHtml = nunjucksWithLayout.render('archive.html', { posts: postData });

		await fsh.writeFile(`${settings.buildPath}/blog/archive.html`, archiveHtml);

		const totalPosts = postData.length,
			postsPerPage = 10,
			pagesOfPosts = Math.ceil(totalPosts / postsPerPage);

		let i = 0;
		while (i < pagesOfPosts) {
			const start = i++ * postsPerPage,
				remaining = postData.length - start,
				end = start + ( remaining > postsPerPage ? postsPerPage : remaining );

			const url = i > 1 ? `/posts/${i}` : '',
				path = `${settings.buildPath}${url}`,
				file = `${path}/${indexFile}`;

			console.log(i > 1 ? `posts/${i - 1}` : null, i < pagesOfPosts ? `posts/${i + 1}` : null);

			const html = nunjucksWithLayout.render('index.html', {
				posts: postData.slice(start, end),
				prev: ( i > 1 ? `/posts/${i - 1}` : null ),
				next: ( i < pagesOfPosts ? `/posts/${i + 1}` : null )
			});

			await fsh.mkdirp(path);

			await fsh.writeFile(file, html);
		}
	};

	await buildTemplates();
};

gulp.task('posts', function(cb) {
	init()
		.then(() => cb());
});
