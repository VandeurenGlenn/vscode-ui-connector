import {execSync} from 'child_process';
import {glob} from 'glob';

export const DEFAULT_GREP_INCLUDE = 'src/**/*.{ts,tsx,js,jsx,html,css}';

interface FoundObject {
	filepath: string;
	line: number;
	column: number;
	lineContent?: string;
}

export function grep(
	search: string,
	include: string | string[]
): FoundObject[] {
	const files = glob.sync(include);

	if (files.length === 0) {
		return [];
	}

	const grepCommand = `grep -rn '${search}' ${files.join(' ')}`;

	try {
		const grepOutput = execSync(grepCommand, {encoding: 'utf-8'});
		const lines = grepOutput.split('\n').filter((line) => line !== '');

		const foundObjects: FoundObject[] = lines.map((grepLine) => {
			const [filepath, line, lineContent] = grepLine.split(':');
			const foundObject: FoundObject = {
				filepath,
				line: parseInt(line),
				column: lineContent.indexOf(search),
				lineContent,
			};
			return foundObject;
		});

		return foundObjects;
	} catch (error: any) {
		if ('status' in error) {
			if (error.status === 1) {
				return [];
			}
		}
		// Something went wrong with subshell grep
		throw error;
	}
}
