import fsh from './fs_helpers';

const defaults = {
	srcPath: './src',
	buildPath: './.build',
	postTemplate: 'post.html',
	postUrl: '/blog/{{ year }}/{{ month }}/{{ day }}/{{ fileName }}/'
};

export default async function getSettings(rootPath) {
	let dotFile;

	try {
		dotFile = JSON.parse((await fsh.readFile(`${rootPath}/.mistletoerc`)).toString());
	}
	catch(err) {}

	if (dotFile === undefined) {
		return defaults;
	}

	return Object.assign({}, defaults, dotFile);
}
