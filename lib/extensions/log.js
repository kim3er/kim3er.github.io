import chalk from 'chalk';

export default function log(step, message) {
	console.log(`${chalk.bold.magenta(step)} ${message}`);
}
