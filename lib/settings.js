import fsh from './extensions/fs';

const defaults = {
	srcPath: './src',
	buildPath: './.build',
	postTemplate: 'post.html',
	postUrl: '/blog/{{ year }}/{{ month }}/{{ day }}/{{ fileName }}/',
	indexFile: 'index.html',
	filters: { }
};

export default async function getSettings() {
	let dotFile;

	try {
		dotFile = JSON.parse((await fsh.readFile(`./.mistletoerc`)).toString());
	}
	catch(err) { console.log(err)}

	if (dotFile === undefined) {
		return defaults;
	}

	return Object.assign({}, defaults, dotFile);
}
