import { PopulateOptions, UpdateQuery } from 'mongoose';
import path from 'path';

import InvalidError from '../error/invalid';
import Kanji from '../dto/Kanji';
import { selectElement } from '../utils';
import { UpdateKanjiProps } from '../types/enums';
import { CharacterModel, KanjiModel, KanjiDocument, RadicalModel, ReferenceModel } from '../models';

export const getOne = (id: string) => {
  return KanjiModel.findOne({ kanji_id: id }).select('-_id -__v -examples._id').populate('kanji', '-_id -__v').populate('radical', '-_id -__v').populate('reference', '-_id -__v').exec();
};

export const getOneImage = (encodedKanji: string) => {
  const kanji = decodeURIComponent(encodedKanji);

  return path.join(process.cwd(), 'data', 'svg', `${kanji.charCodeAt(0)}.svg`);
};

export const getAll = async (page: number, limit: number, grade?: string) => {
  const query: Partial<{ deleted_at: string | null; reference: { $in: string[] } | null }> = { deleted_at: null };
  if (grade)
    query['reference'] = {
      $in: await ReferenceModel.find({ grade }).select('id').exec(),
    };

  const populate = [
    { path: 'kanji', select: 'character_id character meaning onyomi kunyomi strokes -_id' } as PopulateOptions,
    { path: 'radical', select: 'radical_id -_id' } as PopulateOptions,
    { path: 'reference', select: 'reference_id -_id grade' } as PopulateOptions,
  ];
  return KanjiModel.paginate(query, { limit, page, populate, select: '-_id -__v -examples' });
};

export const searchCharacter = async (query: string, page = 1, limit = 10) => {
  const charactersAggregate = await CharacterModel.aggregate()
    .search({
      index: 'searchKanji',
      text: {
        query,
        path: {
          wildcard: '*',
        },
      },
    })
    .exec();

  const q: Partial<{ deleted_at: string | null; kanji: object }> = { deleted_at: null };
  q['kanji'] = {
    $in: charactersAggregate,
  };

  const populate = [
    { path: 'kanji', select: 'character_id character meaning onyomi kunyomi -_id' } as PopulateOptions,
    { path: 'radical', select: 'radical_id -_id' } as PopulateOptions,
    { path: 'reference', select: 'reference_id -_id grade' } as PopulateOptions,
  ];
  return KanjiModel.paginate(q, { limit, page, populate, select: '-_id -__v -examples' });
};

export const addOne = async (body: KanjiType) => {
  const promiseArray = [];
  promiseArray.push(CharacterModel.find({ character_id: body.kanji }).exec());
  promiseArray.push(RadicalModel.find({ radical_id: body.radical }).exec());
  promiseArray.push(ReferenceModel.find({ reference_id: body.reference }).exec());

  const promisesResult = await Promise.allSettled(promiseArray);
  const isInvalid = promisesResult.some((promise) => promise.status === 'rejected');

  if (isInvalid) throw new Error('Invalid input');

  const fulfilledChar = promisesResult[0] as unknown as PromiseFulfilledResult<CharacterType[]>;
  const fulfilledRad = promisesResult[1] as unknown as PromiseFulfilledResult<RadicalType[]>;
  const fulfilledRef = promisesResult[2] as unknown as PromiseFulfilledResult<ReferenceType[]>;

  const kanji = new Kanji(fulfilledChar.value[0], fulfilledRad.value[0], fulfilledRef.value[0], body.examples);

  const r: KanjiType = await new Promise((resolve, reject) => {
    KanjiModel.create(
      {
        kanji: fulfilledChar.value[0],
        radical: fulfilledRad.value[0],
        reference: fulfilledRef.value[0],
        examples: body.examples,
        creation_date: new Date(),
      },
      (err, res) => {
        if (err) {
          reject(new InvalidError(err.message));
        } else {
          resolve(res);
        }
      }
    );
  });

  if (r instanceof InvalidError) {
    throw r;
  }

  return kanji.toDTO(r.kanji_id, r.creation_date);
};

export const updateOne = async (id: string, type: UpdateKanjiProps, elementId: string) => {
  const updatedRef: CharacterType | RadicalType | ReferenceType | InvalidError = await new Promise((resolve, reject) => {
    if (type === UpdateKanjiProps.UPDATE_CHARACTER)
      CharacterModel.findOne({ character_id: elementId })
        .exec()
        .then((characterRes) => resolve(characterRes as CharacterType))
        .catch(reject);
    else if (type === UpdateKanjiProps.UPDATE_RADICAL)
      RadicalModel.findOne({ radical_id: elementId })
        .exec()
        .then((radicalRes) => resolve(radicalRes as RadicalType))
        .catch(reject);
    else if (type === UpdateKanjiProps.UPDATE_REFERENCE)
      ReferenceModel.findOne({ reference_id: elementId })
        .exec()
        .then((referenceRes) => resolve(referenceRes as ReferenceType))
        .catch(reject);
    else reject(new InvalidError('Invalid UpdateKanjiProps'));
  });

  if (updatedRef instanceof InvalidError) throw updatedRef;

  return KanjiModel.findOneAndUpdate({ kanji_id: id }, selectElement(type, updatedRef) as UpdateQuery<KanjiDocument>)
    .select('-_id -__v -examples._id')
    .exec();
};

export const deleteOne = (id: string) => {
  return KanjiModel.findOneAndUpdate({ kanji_id: id }, { deleted_at: new Date() }).select('-_id -__v -examples._id').exec();
};

export const autocompleteId = (input: string, limit = 10) => {
  return KanjiModel.find({ kanji_id: { $regex: `^${input}`, $options: 'i' } })
    .select('kanji_id -_id ')
    .populate('kanji', 'character meaning -_id')
    .limit(limit)
    .exec();
};

export const addExampleId = (id: string, example: ExampleType) => {
  return KanjiModel.findOneAndUpdate({ kanji_id: id }, { $push: { examples: example } }).exec();
};

export const removeExampleId = async (id: string, index: number) => {
  if (isNaN(index)) throw new InvalidError('Invalid example index');

  const kanji = await KanjiModel.findOne({ kanji_id: id }).exec();

  const newExamples = kanji?.examples.filter((_, i) => i !== index);

  return KanjiModel.findOneAndUpdate({ kanji_id: id }, { examples: newExamples }).exec();
};

export const randomKanji = async (number = 1) => {
  const res = await KanjiModel.aggregate([
    { $sample: { size: number } },
    {
      $lookup: {
        from: 'characters',
        localField: 'kanji',
        foreignField: '_id',
        as: 'kanji',
      },
    },
    {
      $project: {
        __v: 0,
        _id: 0,
        creation_date: 0,
        reference: 0,
        deleted_at: 0,
        'kanji._id': 0,
        'kanji.__v': 0,
      },
    },
  ]);

  return res;
};
