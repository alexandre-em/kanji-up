import axios from 'axios';
import dotenv from 'dotenv';

import { CharacterModel, KanjiModel, RadicalModel, ReferenceModel } from '../src/models';
import { CharacterType, KanjiType, RadicalType, ReferenceType } from '../src/utils';

const addData = async (kanjiDetail) => {
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

		console.log(isInvalid);
		
		if (isInvalid)
			throw new Error('Invalid input');

		console.log('All promise are settled !');
		console.log('Adding all Kanji details...');



		const fulfilledChar = promisesResult[0] as PromiseFulfilledResult<CharacterType>;
		const fulfilledRad = promisesResult[1] as PromiseFulfilledResult<RadicalType>;
		const fulfilledRef = promisesResult[2] as PromiseFulfilledResult<ReferenceType>;
		const examples = kanjiDetail.examples.map((example) => ({ japanese: example.japanese, meaning: example.meaning.english }));

		const kanjiRes: KanjiType = await new Promise((resolve, reject) => {
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

		console.log(kanjiRes.kanji_id);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

export const migrateFromKanjiApi = async () => {
	dotenv.config();
	console.log('Fetching data from  KanjiApi...');

	const kanjiList = await axios.get(`https://${process.env.KANJI_ALIVE_API_DOMAIN}/api/public/kanji/all`, {
		headers: {
			'x-rapidapi-host': process.env.KANJI_ALIVE_API_DOMAIN,
			'x-rapidapi-key': process.env.KANJI_ALIVE_API_KEY,
			'useQueryString': 'true',
		}
	});

	console.log('Adding fetched data into MongoDB...');

	try {
		let queue = [];
		for (let i = 0; i < kanjiList.data.length - 6; i += 5) {
			for (let j = 0; j < 5; j++) {
				console.log(`index ${i+j}`);
				
				queue.push(addData(kanjiList.data[i + j]));
			}
			await Promise.allSettled(queue);
			queue = [];
		}
		console.log('Migration has been completed !!');
	} catch (e) {
		console.error(e);
	} finally {
		process.exit(1)
	}
}
