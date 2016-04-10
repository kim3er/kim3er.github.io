import 'babel-polyfill';

import path from 'path';

import fsh from './extensions/fs';

import Renderer from './components/renderer';

import grabPostData from './parsers/posts';

import renderArchive from './renderers/archive';
import renderPosts from './renderers/posts';
import renderCategories from './renderers/categories';
import renderAtom from './renderers/atom';

import getSettings from './settings';

export default async function init() {
	const projectRoot = await (async function() {
		async function checkDir(dir) {
			if ((await fsh.readdir(dir)).includes('.mistletoerc')) {
				return dir;
			}
			else {
				if (path.parse(dir).root === dir) {
					throw 'Can\'t find file';
				}

				return await checkDir(path.join(dir, '..'));
			}
		};

		return await checkDir(__dirname);
	})();

	const settings = await getSettings(),
		postsSrcPath = `${settings.srcPath}/posts`,
		renderer = new Renderer(settings, projectRoot);

	await fsh.rimraf(settings.buildPath);

	const { postsByYear, categories, postCount } = await grabPostData(postsSrcPath, settings, renderer);

	await renderPosts(renderer, settings, postsByYear.reduce((a, b) => { return a.concat(b.posts); }, []));

	await renderArchive(renderer, settings, postsByYear, postCount);
	await renderCategories(renderer, settings, categories);
	await renderAtom(renderer, settings, postsByYear);

	await (async function() {
		const plugins = {
			'.scss': 'do stuff'
		};

		const pluginExtnames = Object.keys(plugins);

		async function processDir(dir) {
			const ls = await fsh.readdir(dir);

			for (const entry of ls) {
				if (entry.startsWith('.')) {
					continue;
				}

				const entryPath = `${dir}/${entry}`;

				if ((await fsh.lstat(entryPath)).isDirectory()) {
					await processDir(entryPath);
				}
				else {
					if (entry.startsWith('_')) {
						continue;
					}

					let destFileName;

					const extname = path.extname(entry);
					if (pluginExtnames.includes(extname)) {
						destFileName = `${path.basename(entry, extname)}${'.css'}`;
					}
					else {
						destFileName = entry;
					}

					const pathFragment = dir.slice(settings.srcPath.length),
						srcPath = path.join(projectRoot, entryPath),
						destDir = path.join(projectRoot, settings.buildPath, pathFragment),
						destPath = path.join(destDir, destFileName);

					await fsh.mkdirp(destDir);

					await fsh.cp(srcPath, destPath);

					console.log(srcPath, destPath, destDir);
				}
			}
		}

		await processDir(`${settings.srcPath}/stylesheets`);
	})();
};
