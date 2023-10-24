import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Word, WordDocument } from './word.schema';
import { CreateWordDto, UpdateWordDto } from './word.dto';
import { createPaginateData } from 'src/utils';

@Injectable()
export class WordService {
  constructor(@InjectModel(Word.name) private readonly model: Model<WordDocument>) {}

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
      .select('-_id -definition._id -definition.relation._id -__v')
      .populate('definition.example', '-_id sentence translation sentence_id')
      .populate('definition.relation.related_word', 'word reading word_id -_id')
      .exec();
  }

  findWordWithRelatedWord() {
    return this.model.find({ 'definition.related_word': { $elemMatch: { $ne: null } } }).exec();
  }

  findWordReadingQuery(word: string, word_id?: string) {
    if (word_id) return this.model.find({ $and: [{ $or: [{ word }, { reading: word }] }, { word_id: { $ne: word_id } }] }).exec();

    return this.model.find({ $or: [{ word }, { reading: word }] }).exec();
  }

  updateOneById(id: string, body: UpdateWordDto) {
    return this.model.updateOne({ word_id: id }, body).exec();
  }

  deleteOneById(id: string) {
    return this.model.updateOne({ word_id: id }, { deleted_at: new Date() }).exec();
  }
}
