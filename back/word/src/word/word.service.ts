import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Word, WordDocument } from './word.schema';
import { CreateWordDto, UpdateWordDefinitionDTO, UpdateWordUUIDDTO, UpdateWordDefinitionTypeDto, UpdateWordReadingDTO } from './word.dto';
import { createPaginateData, createPaginateDataFromAggregation } from '../utils';
import { SentenceService } from '../sentence/sentence.service';

type UpdateWordDefinitionUnionType = UpdateWordUUIDDTO | UpdateWordDefinitionDTO | UpdateWordDefinitionTypeDto;

@Injectable()
export class WordService {
  constructor(
    @InjectModel(Word.name) private readonly model: Model<WordDocument>,
    private readonly sentenceService: SentenceService
  ) {}

  create(body: CreateWordDto) {
    return this.model.create(body);
  }

  findAll() {
    return this.model.find().exec();
  }

  findAllPaginate(page = 1, limit = 20) {
    if (page < 1) throw new BadRequestException('Put a valid page number > 0');

    const query = this.model
      .find({ deleted_at: null })
      .select('-_id -definition.example -definition._id -definition.relation -definition.related_word -definition.type -defintion.description -__v -created_at -deleted_at');

    return createPaginateData(page, limit, query);
  }

  findOneById(id: string) {
    return this.model
      .findOne({ word_id: id, deleted_at: null })
      .select('-_id -definition._id -definition.relation._id -definition.related_word -__v')
      .populate('definition.example', '-_id sentence translation sentence_id')
      .populate('definition.relation.related_word', 'word reading word_id -_id')
      .exec();
  }

  findWordWithRelatedWord() {
    return this.model.find({ 'definition.related_word': { $elemMatch: { $ne: null } } }).exec();
  }

  // Matches spelling or reading — そば (蕎麦) has a real kanji form but is routinely written or
  // scanned in kana only, same for plenty of other words, so restricting to spelling alone missed
  // most of them. A shared reading occasionally picking an unintended homophone (きょう / 今日) is
  // an accepted tradeoff: still a real word for that kana string, just not guaranteed the one the
  // photo meant — better than surfacing nothing at all for kana-only text.
  //
  // Also resolves which reading actually belongs to the matched spelling, so the caller (OCR
  // furigana) doesn't have to fetch the full word and guess: positional pairing when reading and
  // word are the same length, otherwise the word's first reading — same fallback as the mobile
  // word detail screen, since alternate spellings usually share one reading anyway. Matched via
  // reading rather than spelling, the reading is simply what was searched.
  async findExactWordMatch(word: string) {
    const doc = await this.model
      .findOne({ deleted_at: null, $or: [{ word }, { reading: word }] })
      .select('word_id word reading -_id')
      .exec();

    if (!doc) return null;

    const spellingIndex = doc.word.indexOf(word);
    const reading = spellingIndex === -1 ? word : doc.reading.length === doc.word.length ? doc.reading[spellingIndex] : doc.reading[0] ?? null;

    return { word_id: doc.word_id, reading };
  }

  findWordReadingQuery(word: string, word_id?: string) {
    if (word_id) return this.model.find({ $and: [{ $or: [{ word }, { reading: word }] }, { word_id: { $ne: word_id } }] }).exec();

    return this.model.find({ $or: [{ word }, { reading: word }] }).exec();
  }

  updateOneById(id: string, body: UpdateWordReadingDTO) {
    return this.model.updateOne({ word_id: id }, body).exec();
  }

  async addElementToArray(word_id: string, keyDef: string, body: UpdateWordDefinitionUnionType) {
    return this.model.updateOne({ word_id }, { $addToSet: { [keyDef]: Array.isArray(body.data) ? { $each: body.data } : body.data } }).exec();
  }

  async removeElementToArray(word_id: string, keyDef: string, body: UpdateWordDefinitionUnionType) {
    return this.model.updateOne({ word_id }, Array.isArray(body.data) ? { $pullAll: { [keyDef]: body.data } } : { $pull: { [keyDef]: body.data } }).exec();
  }

  async addDefinitionExample(word_id: string, index: number, body: UpdateWordUUIDDTO) {
    const keyDefType = `definition.${index}.example`;

    const sentences = await this.sentenceService.find({ sentence_id: { $in: body.data } });

    return this.addElementToArray(word_id, keyDefType, { data: sentences } as unknown as UpdateWordDefinitionUnionType);
  }

  async removeDefinitionExample(word_id: string, index: number, body: UpdateWordUUIDDTO) {
    const keyDefType = `definition.${index}.example`;

    const sentences = await this.sentenceService.find({ sentence_id: { $in: body.data } });

    return this.removeElementToArray(word_id, keyDefType, { data: sentences } as unknown as UpdateWordDefinitionUnionType);
  }

  async addDefinitionRelation(word_id: string, index: number, body: UpdateWordUUIDDTO) {
    const keyDefType = `definition.${index}.relation`;

    const sentences = await this.model.find({ word_id: { $in: body.data } }).exec();

    return this.addElementToArray(word_id, keyDefType, { data: sentences } as unknown as UpdateWordDefinitionUnionType);
  }

  async removeDefinitionRelation(word_id: string, index: number, body: UpdateWordUUIDDTO) {
    const keyDefType = `definition.${index}.relation`;

    const sentences = await this.model.find({ word_id: { $in: body.data } }).exec();

    return this.removeElementToArray(word_id, keyDefType, { data: sentences } as unknown as UpdateWordDefinitionUnionType);
  }

  deleteOneById(id: string) {
    return this.model.updateOne({ word_id: id }, { deleted_at: new Date() }).exec();
  }
  async searchWord(query: string, page = 1, limit = 20) {
    const wordAggregate = this.model
      .aggregate()
      .search({
        index: 'default',
        compound: {
          // Base CJK-tokenized match across word/reading/definitions, kept broad so partial and
          // fuzzy hits (compounds, related words) still surface — same behavior as before
          should: [
            { text: { query, path: ['word', 'reading', 'definition.meaning'] } },
            // A verbatim match on the un-analyzed spelling/reading (e.g. querying "そば" and a
            // document's word/reading being exactly "そば") massively outranks any compound that
            // merely contains it (塩そば, そば屋, ...) — this is what fixes short common words
            // getting buried under their own compounds in the results
            { text: { query, path: ['word.exact', 'reading.exact'], score: { boost: { value: 5 } } } },
          ],
          minimumShouldMatch: 1,
        },
      })
      .match({ deleted_at: null })
      .project({
        _id: 0,
        'definition.example': 0,
        'definition._id': 0,
        'definition.relation': 0,
        'definition.related_word': 0,
        'definition.type': 0,
        'definition.description': 0,
        __v: 0,
        created_at: 0,
        deleted_at: 0,
      });

    return createPaginateDataFromAggregation(page, limit, wordAggregate);
  }

  getNRandomWord(number: number, inIds?: string[]) {
    let aggregate = this.model.aggregate();

    if (inIds) aggregate = aggregate.match({ word_id: { $in: inIds } });

    return aggregate.sample(number);
  }

  /**
   * @description Words practicable with a given set of already-selected kanji characters: every
   * character in the word's spelling must be one of `characters` (not just an overlap), so the
   * drawing game never asks for a kanji the user hasn't chosen to learn yet. No cross-service
   * lookup needed — `word` is already a plain character string, so a character-class regex
   * ("every char in this word is in this allowed set") does the matching directly in Mongo.
   */
  getPracticeWords(characters: string[], number = 10) {
    if (characters.length === 0) return Promise.resolve([]);

    const allowedCharacterClass = characters.map((char) => char.replace(/[\\\]^-]/g, '\\$&')).join('');
    const onlyAllowedCharacters = new RegExp(`^[${allowedCharacterClass}]+$`);

    return this.model.aggregate([{ $match: { deleted_at: null, word: onlyAllowedCharacters } }, { $sample: { size: number } }]);
  }
}
