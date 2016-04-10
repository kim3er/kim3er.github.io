import fs from 'fs';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

export default class FsHelpers {

	// http://stackoverflow.com/a/14387791/110010
	static cp(source, target) {
		return new Promise(function(resolve, reject) {
			const rd = fs.createReadStream(source);
			rd.on('error', function(err) {
			  reject(err);
			});

			const wr = fs.createWriteStream(target);
			wr.on('error', function(err) {
			  reject(err);
			});
			wr.on('close', function(ex) {
			  resolve();
			});

			rd.pipe(wr);
		});
	}

	static lstat(path) {
		return new Promise(function(resolve, reject) {
			fs.lstat(path, function(err, stats) {
				if (err) {
					reject(err);
				}
				else {
					resolve(stats);
				}
			});
		});
	}

	static mkdirp(path) {
		return new Promise(function(resolve, reject) {
			mkdirp(path, function(err) {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		});
	};

	static readdir(path) {
		return new Promise(function(resolve, reject) {
			fs.readdir(path, function(err, data) {
				if (err) {
					reject(err);
				}
				else {
					resolve(data);
				}
			});
		});
	}

	static readFile(file) {
		return new Promise(function(resolve, reject) {
			fs.readFile(file, function(err, data) {
				if (err) {
					reject(err);
				}
				else {
					resolve(data);
				}
			});
		});
	}

	static rimraf(path) {
		return new Promise(function(resolve) {
			rimraf(path, resolve);
		});
	}

	static writeFile(file, data) {
		return new Promise(function(resolve, reject) {
			fs.writeFile(file, data, function(err) {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		});
	}

}
