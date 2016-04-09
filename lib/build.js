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
	const settings = await getSettings(),
		postsSrcPath = `${settings.srcPath}/posts`,
		renderer = new Renderer(settings, path.resolve('.'));

	await fsh.rimraf(settings.buildPath);

	const { postsByYear, categories, postCount } = await grabPostData(postsSrcPath, settings, renderer);

	for (const year of postsByYear) {
		await renderPosts(renderer, settings, year.posts);
	}

	await renderArchive(renderer, settings, postsByYear, postCount);
	await renderCategories(renderer, settings, categories);
	await renderAtom(renderer, settings, postsByYear);
};
