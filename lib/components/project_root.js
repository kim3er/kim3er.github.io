import path from 'path';

import fsh from '../extensions/fs';

export default async function projectRoot(currentDir) {
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

	return await checkDir(currentDir);
}
