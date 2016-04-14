import 'babel-polyfill';

import path from 'path';

import ghpages from 'gh-pages';

import getProjectRoot from './components/project_root';
import getSettings from './settings';

export default async function publish() {
	const settings = await getSettings(),
		projectRoot = await getProjectRoot(__dirname);

	await new Promise(function(resolve, reject) {
		ghpages.publish(path.join(projectRoot, settings.buildPath), {
		  branch: 'master',
		}, function(err) {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});

	console.log('published');
}
