import nunjucks from 'nunjucks';

export default class Renderer {

	constructor(settings, path) {
		this.engine = new nunjucks.Environment(new nunjucks.FileSystemLoader(`${settings.srcPath}/layouts`));

		for (const filterName in settings.filters) {
			const filter = settings.filters[filterName];

			let filterPath;
			if (typeof filter === 'string' || !filter.local) {
				filterPath = filter;
			}
			else {
				filterPath = `${path}/lib/filters/${filter.path}`;
			}

			this.engine.addFilter(filterName, require(filterPath).default);
		}
	}

	render(template, data) {
		return this.engine.render(template, data);
	}

	renderString(template, data) {
		return this.engine.renderString(template, data);
	}

}
