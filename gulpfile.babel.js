import 'babel-polyfill';

import data from 'gulp-data';
import fm from 'front-matter';
import fs from 'fs';
import gulp from 'gulp';
import marked from 'marked';
import mkdirp from 'mkdirp';
import moment from 'moment';
import nunjucks from 'nunjucks';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import rimraf from 'rimraf';

const SRC_PATH = './src',
	BUILD_PATH = './.build';

const POSTS_SRC_PATH = `${SRC_PATH}/posts`,
	LAYOUTS_SRC_PATH = `${SRC_PATH}/layouts`;

const POST_TEMPLATE = 'post.html';

const INDEX_FILE = 'index.html';

const POST_URL = '/blog/{{ year }}/{{ month }}/{{ day }}/{{ fileName }}/';

const POST_REGEX = /^([\d]{4})\-([\d]{2})\-([\d]{2})\-([\w\d\-]+)\.(markdown|md)$/;

const nunjucksWithLayout = new nunjucks.Environment(new nunjucks.FileSystemLoader(LAYOUTS_SRC_PATH));

const removeBuild = function() {
	return new Promise(function(resolve) {
		rimraf(BUILD_PATH, resolve);
	});
}

const readDir = function(path) {
	return new Promise(function(resolve, reject) {
		fs.readdir(POSTS_SRC_PATH, function(err, data) {
			if (err) {
				reject(err);
			}
			else {
				resolve(data);
			}
		});
	});
}

const readFile = function(file) {
	return new Promise(function(resolve, reject) {
		fs.readFile(file, function(err, data) {
			if (err) {
				reject(err);
			}
			else {
				resolve(data);
			}
		});
	});
};

const writeFile = function(file, data) {
	return new Promise(function(resolve, reject) {
		fs.writeFile(file, data, function(err) {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
};

const mkDirP = function(path) {
	return new Promise(function(resolve, reject) {
		mkdirp(path, function(err) {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
};

const grabPostData = async function() {
	const files = await readDir(POSTS_SRC_PATH),
		fileArr = [];

	for (const file of files) {
		const matches = file.match(POST_REGEX);

		if (!matches) {
			continue;
		}

		const year = matches[1],
			month = matches[2],
			day = matches[3],
			fileName = matches[4];

		const body = await readFile(`${POSTS_SRC_PATH}/${file}`),
			data = fm(String(body));

		if ('published' in data.attributes && data.attributes.published === false) {
			continue;
		}

		data.attributes.url = nunjucks.renderString(POST_URL, { year, month, day, fileName });
		data.attributes.destPath = `${BUILD_PATH}${data.attributes.url}`;
		data.attributes.destFile = `${data.attributes.destPath}/${INDEX_FILE}`;

		fileArr.push(data);
	}

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
			html = nunjucksWithLayout.render(POST_TEMPLATE, fileData);

		await mkDirP(data.attributes.destPath);

		await writeFile(data.attributes.destFile, html);
	}
};

const buildTemplates = async function() {
	await removeBuild();

	const postData = await grabPostData();

	await renderPosts(postData);

	const totalPosts = postData.length,
		postsPerPage = 10;
};

gulp.task('posts', function(cb) {
	buildTemplates()
		.then(() => cb());
});
