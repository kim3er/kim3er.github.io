import fsh from '../extensions/fs';
import log from '../extensions/log';

export default async function renderAtom(renderer, settings, postsByYear) {
	const lastUpdated = postsByYear[0].posts[0].attributes.date,
		html = renderer.render('atom.xml', { postsByYear, lastUpdated });

	await fsh.writeFile(`${settings.buildPath}/atom.xml`, html);
}
