import { CharacterModel, KanjiModel, RadicalModel, ReferenceModel } from "../models";
import InvalidError from "../error/invalid";
import Kanji from "../dto/Kanji";
import { selectElement } from "../utils";
import { PopulateOptions } from "mongoose";

export const getOne = (id: string) => {
	return KanjiModel
		.findOne({ kanji_id: id })
		.select('-_id -__v -examples._id')
		.populate('kanji', '-_id -__v')
		.populate('radical', '-_id -__v')
		.populate('reference', '-_id -__v')
		.exec();
}

export const getAll = async (page: number, limit: number, grade: string) => {
	const query = {};
	if (grade)
		query['reference'] = {
			$in: await ReferenceModel.find({ grade })
				.select('id')
				.exec(),
		};

	const populate = [
		({ path: 'kanji', select: 'character_id image -_id' } as PopulateOptions),
		({ path: 'radical', select: 'radical_id -_id' } as PopulateOptions),
		({ path: 'reference', select: 'reference_id -_id grade' } as PopulateOptions),
	]
	return KanjiModel
		.paginate(query, { limit, page, populate, select: '-_id -__v -examples' })
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

	const r: KanjiType = await new Promise((resolve, reject) => {
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

export const updateOne = async (id: string, type: UpdateKanjiProps, elementId: string) => {
	const updatedRef: CharacterType | RadicalType | ReferenceType | InvalidError = await new Promise((resolve, reject) => {

		if (type === UpdateKanjiProps.UPDATE_CHARACTER)
			CharacterModel.findOne({ character_id: elementId })
				.exec()
				.then(resolve)
				.catch(reject);
		else if (type === UpdateKanjiProps.UPDATE_RADICAL)
			RadicalModel.findOne({ radical_id: elementId })
				.exec()
				.then(resolve)
				.catch(reject);
		else if (type === UpdateKanjiProps.UPDATE_REFERENCE)
			ReferenceModel.findOne({ reference_id: elementId })
				.exec()
				.then(resolve)
				.catch(reject);
		else
			reject(new InvalidError("Invalid UpdateKanjiProps"));
	});

	if (updatedRef instanceof InvalidError)
		throw updatedRef;

	return KanjiModel
		.findOneAndUpdate({ kanji_id: id }, selectElement(type, updatedRef))
		.select('-_id -__v -examples._id')
		.exec();
}

export const deleteOne = (res, req) => {

}
