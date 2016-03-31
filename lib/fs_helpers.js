import fs from 'fs';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

export default class FsHelpers {

	static rimraf(path) {
		return new Promise(function(resolve) {
			rimraf(path, resolve);
		});
	}

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
	};

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
	};

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

}
