import fsh from '../extensions/fs';
import log from '../extensions/log';

export default async function renderAtom(renderer, settings, postsByYear) {
	const lastUpdated = postsByYear[0].posts[0].date,
		atomXml = renderer.render('atom.xml', { postsByYear, lastUpdated }),
		sitemapXml = renderer.render('sitemap.xml', { postsByYear });

	await fsh.writeFile(`${settings.buildPath}/atom.xml`, atomXml);
	await fsh.writeFile(`${settings.buildPath}/sitemap.xml`, sitemapXml);
}
