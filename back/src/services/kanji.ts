import {CharacterModel, KanjiModel, RadicalModel, ReferenceModel} from "../models";
import {CharacterType, KanjiType, RadicalType, ReferenceType} from "../utils";
import Character from "../dto/Character";
import InvalidError from "../error/invalid";
import Kanji from "../dto/Kanji";

export const getOne = (id: string) => {
	return KanjiModel.findOne({ kanji_id: id }).exec();
}

export const getAll = (req, res) => {

}

export const addOne = async (body) => {
	const promiseArray = [];
	promiseArray.push(CharacterModel.find({ character_id: body.characterId }).exec());
	promiseArray.push(RadicalModel.find({ radical_id: body.radicalId }).exec());
	promiseArray.push(ReferenceModel.find({ reference_id: body.referenceId }).exec());

	const promisesResult = await Promise.allSettled(promiseArray);
	const isInvalid = promisesResult.some((promise) => promise.status === 'rejected');

	if (isInvalid)
		throw new Error('Invalid input')

	const fulfilledChar = promisesResult[0] as PromiseFulfilledResult<CharacterType>;
	const fulfilledRad = promisesResult[1] as PromiseFulfilledResult<RadicalType>;
	const fulfilledRef = promisesResult[2] as PromiseFulfilledResult<ReferenceType>;

	const kanji = new Kanji(fulfilledChar.value[0], fulfilledRad.value[0], fulfilledRef.value[0], body.examples);

	const r:KanjiType = await new Promise((resolve, reject) => {
		KanjiModel.create({
			kanji: fulfilledChar.value[0],
			radical: fulfilledRad.value[0],
			reference: fulfilledRef.value[0],
			examples: body.examples,
			creation_date: new Date(),
		}, (err, res) => {
			if (err) {
				reject(new InvalidError(err.message));
      } else {
				resolve(res);
      }
		});
	});

	if (r instanceof InvalidError) {
		throw r;
	}

	return kanji.toDTO(r.kanji_id, r.creation_date);
}

export const updateOne = (res, req) => {

}

export const deleteOne = (res, req) => {

}
