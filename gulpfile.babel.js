import async from 'async';
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

gulp.task('posts', function(gulpCallback) {
	const srcPath = './src/_posts',
		env = new nunjucks.Environment(new nunjucks.FileSystemLoader('./src/_layouts'));

	fs.readdir(srcPath, function(err, files) {
		const fileArr = [],
			fileRegex = /^([\d]{4})\-([\d]{2})\-([\d]{2})\-([\w\d\-]+)\.(markdown|md)$/;

		for (const file of files) {
			const matches = file.match(fileRegex);

			if (!matches) {
				continue;
			}

			const year = matches[1],
				month = matches[2],
				day = matches[3],
				fileName = matches[4];

			const body = fs.readFileSync(`${srcPath}/${file}`);
			const data = fm(String(body));

			if ('published' in data.attributes && data.attributes.published === false) {
				continue;
			}

			data.attributes.url = `/blog/${year}/${month}/${day}/${fileName}/`;
			data.attributes.destPath = `./build${data.attributes.url}`;
			data.attributes.destFile = `${data.attributes.destPath}/index.html`;

			fileArr.push(data);
		}

		for (var i = 0, l = fileArr.length; i < l; i++) {
			const data = fileArr[i],
				contents = marked(data.body);

			let next, prev;

			if (( i + 1 ) < l) {
				next = fileArr[i + 1].attributes;
			}

			if (i > 0) {
				prev = fileArr[i - 1].attributes;
			}

			const fileData = Object.assign({}, data.attributes, { contents, next, prev }),
				html = env.render('post.html', fileData);

			mkdirp.sync(data.attributes.destPath);

			fs.writeFileSync(data.attributes.destFile, html);
		}

		const totalPosts = fileArr.length,
			postsPerPage = 10;

		gulpCallback();
	});
});
