import nunjucks from 'nunjucks';

export default class Renderer {

	constructor(settings, path, templateDir) {
		if (!templateDir) {
			templateDir = `${settings.srcPath}/layouts`;
		}

		this.engine = new nunjucks.Environment(new nunjucks.FileSystemLoader(templateDir));

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

	renderString(str, data) {
		return this.engine.renderString(str, data);
	}

}
