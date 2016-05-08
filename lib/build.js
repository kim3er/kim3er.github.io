import 'babel-polyfill';

import path from 'path';

import sass from 'node-sass';

import fsh from './extensions/fs';

import Renderer from './components/renderer';

import grabPostData from './parsers/posts';

import renderArchive from './renderers/archive';
import renderPosts from './renderers/posts';
import renderCategories from './renderers/categories';
import renderAtom from './renderers/atom';

import getSettings from './settings';

export default async function init() {
	const projectRoot = await require('./components/project_root').default(__dirname);

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
		const processors = {
			'.scss': function(file) {
				return new Promise(function(resolve, reject) {
					sass.render({ file }, function(err, result) {
						if (err) {
							reject(err);
						}
						else {
							resolve(result.css);
						}
					});
				});
			}
		};

		const processorExtnames = Object.keys(processors);

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

					let destFileName, processor;

					const extname = path.extname(entry);
					if (processorExtnames.includes(extname)) {
						processor = processors[extname];
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

					if (processor) {
						const buffer = await processor(srcPath);
						fsh.writeFile(destPath, buffer);
					}
					else {
						await fsh.cp(srcPath, destPath);
					}
				}
			}
		}

		await processDir(`${settings.srcPath}/stylesheets`);
	})();

	async function copyImages(dir) {
		const ls = await fsh.readdir(dir);
		for (const entry of ls) {
			if (entry.startsWith('.')) {
				continue;
			}

			const entryPath = `${dir}/${entry}`;

			if ((await fsh.lstat(entryPath)).isDirectory()) {
				await copyImages(entryPath);
			}
			else {
				const pathFragment = dir.slice(settings.srcPath.length),
					srcPath = path.join(projectRoot, entryPath),
					destDir = path.join(projectRoot, settings.buildPath, pathFragment),
					destPath = path.join(destDir, entry);

				await fsh.mkdirp(destDir);
				await fsh.cp(srcPath, destPath);
			}
		}
	};

	await copyImages(`${settings.srcPath}/images`);

	async function copyStatics(dir) {
		const ls = await fsh.readdir(dir);
		for (const entry of ls) {
			const entryPath = `${dir}/${entry}`;

			if ((await fsh.lstat(entryPath)).isDirectory()) {
				await copyStatics(entryPath);
			}
			else {
				const pathFragment = dir.slice(`${projectRoot}/static`.length),
					destDir = path.join(projectRoot, settings.buildPath, pathFragment),
					destPath = path.join(destDir, entry);

				await fsh.mkdirp(destDir);
				await fsh.cp(entryPath, destPath);
			}
		}
	}

	await copyStatics(`${projectRoot}/static`);
};