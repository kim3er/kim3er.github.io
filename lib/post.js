import 'babel-polyfill';

import path from 'path';

import moment from 'moment';
import slug from 'slug';

import fsh from './extensions/fs';
import log from './extensions/log';

import Renderer from './components/renderer';

import getSettings from './settings';

export default async function init() {
	if (process.argv.length < 3) {
		log('POST', 'Hey, you need a title that post!');
		return false;
	}

	const projectRoot = await require('./components/project_root').default(__dirname);

	const settings = await getSettings(),
		postsSrcPath = `${settings.srcPath}/posts`,
		renderer = new Renderer(settings, projectRoot, path.join(projectRoot, 'templates'));

	const date = moment(),
		title = process.argv[2],
		fileName = `${date.format('YYYY-MM-DD')}-${slug(title).toLowerCase()}.markdown`,
		data = {
			date: date.format('YYYY-MM-DD hh:mm:ss ZZ'),
			title
		};

	const filePath = path.join(settings.srcPath, 'posts', fileName);

	try {
		await fsh.lstat(filePath);
		log('POST', 'That post already exists!');
		return false;
	}
	catch(ex) { }

	const contents = await renderer.render('post.markdown', data);

	await fsh.writeFile(path.join(settings.srcPath, 'posts', fileName), contents);

	log('POST', `${fileName} created`);
}
