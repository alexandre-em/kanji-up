import axios from 'axios';
import dotenv from 'dotenv';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors'

import { CharacterModel, KanjiModel, RadicalModel, ReferenceModel } from '../src/models';
import { CharacterType, RadicalType, ReferenceType } from '../src/utils';

const addData = async (kanjiDetail, progressBar) => {
	try {
		const kanjiPromises = [];
		kanjiPromises.push(new Promise((resolve, reject) => {
			const { character, meaning: meaning, strokes, onyomi, kunyomi } = (kanjiDetail.kanji);
			const imageUrl = strokes.images[strokes.images.length - 1];

			axios.get(imageUrl, { responseType: 'arraybuffer' })
				.then(({ data }) => {
					CharacterModel.create({ character, strokes: strokes.count, image: { data, contentType: 'image/svg' }, onyomi: onyomi.katakana, kunyomi: kunyomi.hiragana, meaning: meaning.english }, (err, res) => {
						if (err) {
							CharacterModel.find({ character }).exec()
								.then((characterRes) => resolve(characterRes[0]))
								.catch(reject)
						}
						else {
							resolve(res);
						}
					})
				})
				.catch(() => {
					CharacterModel.create({ character, strokes: strokes.count, onyomi: onyomi.katakana, kunyomi: kunyomi.hiragana, meaning: meaning.english }, (err, res) => {
						if (err) {
							CharacterModel.find({ character }).exec()
								.then((characterRes) => resolve(characterRes[0]))
								.catch(reject)
						}
						else {
							resolve(res);
						}
					})
				});
		}));
		kanjiPromises.push(new Promise((resolve, reject) => {
			const { character, strokes, image: imageUrl, name, meaning } = (kanjiDetail.radical);

			axios.get(imageUrl, { responseType: 'arraybuffer' })
				.then(({ data }) => {
					RadicalModel.create({ character, strokes, image: { data, contentType: 'image/svg' }, name, meaning: meaning.english }, (err, res) => {
						if (err) {
							RadicalModel.find({ character }).exec()
								.then((radicalRes) => resolve(radicalRes[0]))
								.catch(reject)
						}
						else {
							resolve(res);
						}
					})
				})
				.catch(() => {
					RadicalModel.create({ character, strokes, name, meaning: meaning.english }, (err, res) => {
						if (err) {
							RadicalModel.find({ character }).exec()
								.then((radicalRes) => resolve(radicalRes[0]))
								.catch(reject)
						}
						else {
							resolve(res);
						}
					})
				});
		}));
		kanjiPromises.push(new Promise((resolve, reject) => {
			const { grade, kodansha, classic_nelson } = (kanjiDetail.references);
			ReferenceModel.create({ grade: grade ?? 'custom', kodansha, classic_nelson }, (err, res) => {
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
		const fulfilledRad = promisesResult[1] as PromiseFulfilledResult<RadicalType>;
		const fulfilledRef = promisesResult[2] as PromiseFulfilledResult<ReferenceType>;
		const examples = kanjiDetail.examples.map((example) => ({ japanese: example.japanese, meaning: example.meaning.english }));

		await new Promise((resolve, reject) => {
			KanjiModel.create({
				kanji: fulfilledChar.value,
				radical: fulfilledRad.value,
				reference: fulfilledRef.value,
				examples,
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

export const migrateFromKanjiApi = async () => {
	dotenv.config();
	console.log('Fetching data from  KanjiApi...');
	const b2 = new cliProgress.SingleBar({
		format: 'Kanji Migration |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true
	});

	try {
		const kanjiList = await axios.get(`https://${process.env.KANJI_ALIVE_API_DOMAIN}/api/public/kanji/all`, {
			headers: {
				'x-rapidapi-host': process.env.KANJI_ALIVE_API_DOMAIN,
				'x-rapidapi-key': process.env.KANJI_ALIVE_API_KEY,
				'useQueryString': 'true',
			},
		});

		console.log('Adding fetched data into MongoDB...');

		let queue = [];
		b2.start(kanjiList.data.length - 1, 0);
		for (let i = 0; i < kanjiList.data.length; i += 5) {
			for (let j = 0; j < 5; j++) {
				if ((i + j) < kanjiList.data.length) {
					queue.push(addData(kanjiList.data[i + j], b2));
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
