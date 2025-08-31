import cliProgress from 'cli-progress';
import colors from 'ansi-colors'

import { CharacterModel } from "../src/models";

const path = '';
const N = 10;

type JsonKanjiType = {
        "strokes": number;
        "grade": number;
        "freq": number;
        "jlpt_old": number;
        "jlpt_new": number;
        "meanings": string[];
        "readings_on": string[];
        "readings_kun": string[];
        "wk_level": number;
        "wk_meanings": string[];
        "wk_readings_on": string[];
        "wk_readings_kun": string[];
        "wk_radicals": string[];
}

const updateKanjiGrade = async (character: string, jlpt: number) => {
   await CharacterModel.findOneAndUpdate({ character }, {
    jlpt
  }).exec();
}

const openJlptJson = (): Record<string, JsonKanjiType> => {
  return JSON.parse(require('fs').readFileSync(path, 'utf-8'))
}

export const migrateJlpt = async () => {
  const jlptJson = openJlptJson();
  const begin = 0;
  const kanjiKeys = Object.keys(jlptJson);
	const b2 = new cliProgress.SingleBar({
		format: 'Kanji JLPT Migration |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true
	});


		let queue = [] as Promise<void>[];
		b2.start(kanjiKeys.length - 1, begin);
		for (let i = begin; i < kanjiKeys.length; i += N) {
			for (let j = 0; j < N; j++) {
				if ((i + j) < kanjiKeys.length) {
					queue.push(updateKanjiGrade(kanjiKeys[i + j], jlptJson[kanjiKeys[i + j]].jlpt_new));
		      b2.increment();
				}
			}
			await Promise.allSettled(queue);
			queue = [];
		}
}
