import axios from 'axios';
import dotenv from 'dotenv';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors'

import { CharacterModel, KanjiModel, ReferenceModel } from '../src/models';
// import kanji from './kanjiapi_kanji.json';

type DataType = {
	kanjis: any,
}

/**
 * Number of thread that are asynchronously launched to fill the DB
 */
const N = 10;
const kanji = {}; // TODO: to remove if kanji is already imported

const addData = async (kanjiDetail, progressBar) => {
	try {
		const t = await CharacterModel.findOne({ character: kanjiDetail });
		if (t !== null) {
			progressBar.increment();
			return;
		}

		const kanjiPromises = [];
		kanjiPromises.push(new Promise((resolve, reject) => {
			const { kanji: character, meanings: meaning, stroke_count: strokes, on_readings: onyomi, kun_readings: kunyomi } = (kanji as DataType).kanjis[kanjiDetail];

			CharacterModel.create({ character, strokes, onyomi, kunyomi, meaning }, (err, res) => {
				if (err) {
					CharacterModel.find({ character }).exec()
						.then((characterRes) => resolve(characterRes[0]))
						.catch(reject)
				}
				else {
					resolve(res);
				}
			})
		}));
		kanjiPromises.push(new Promise((resolve, reject) => {
			const query = encodeURI(kanjiDetail);
			axios.get(`http://localhost:8000/words/?kanji=${query}`)
				.then((words) => {
					resolve(words.data.map(({ variants, meanings }) => ({
						japanese: `${variants[0].written} (${variants[0].pronounced})`,
						meaning: meanings.reduce((prev, current) => current.glosses.join(', ') + prev, ''),
					})));
				})
				.catch(reject);
		}));
		kanjiPromises.push(new Promise((resolve, reject) => {
			const { grade, unicode: kodansha } = (kanji as DataType).kanjis[kanjiDetail];

			ReferenceModel.create({ grade: grade ?? 'custom', kodansha }, (err, res) => {
				if (err) {
					reject(err.message);
				}
				else {
					resolve(res);
				}
			})
		}));

		const promisesResult = await Promise.allSettled(kanjiPromises);
		const isInvalid = promisesResult.find((promise) => promise.status === 'rejected');

		if (isInvalid)
			throw new Error('Invalid input');

		const fulfilledChar = promisesResult[0] as PromiseFulfilledResult<CharacterType>;
		const fulfilledExple = promisesResult[1] as PromiseFulfilledResult<Array<ExampleType>>;
		const fulfilledRef = promisesResult[2] as PromiseFulfilledResult<ReferenceType>;

		await new Promise((resolve, reject) => {
			KanjiModel.create({
				kanji: fulfilledChar.value,
				reference: fulfilledRef.value,
				examples: fulfilledExple.value,
				creation_date: new Date(),
			}, (err, res) => {
				if (err)
					reject(err)
				if (res)
					resolve(res)
			});
		});

		progressBar.increment();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

export const migrateFromKanjiDic = async () => {
	dotenv.config();
	console.log('Fetching data from  KanjiApi...');
	const b2 = new cliProgress.SingleBar({
		format: 'Kanji Migration |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true
	});

	try {
		const kanjiKeys: Array<string> = Object.keys((kanji as DataType).kanjis);

		console.log('Adding fetched data into MongoDB...');

		let queue = [];
		const begin = 2961;
		b2.start(kanjiKeys.length - 1, begin);
		for (let i = begin; i < kanjiKeys.length; i += N) {
			for (let j = 0; j < N; j++) {
				if ((i + j) < kanjiKeys.length) {
					queue.push(addData(kanjiKeys[i + j], b2));
				}
			}
			await Promise.allSettled(queue);
			queue = [];
		}
		console.log('\n Migration has been completed !!');
	} catch (e) {
		console.error(e);
	} finally {
		b2.stop();
		process.exit(1)
	}
}

