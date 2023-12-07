import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sentence, SentenceDocument } from './sentence.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateSentenceDto, UpdateSentenceDto } from './sentence.dto';
import { createPaginateData } from '../utils';

const selectFields = '-_id -__v -created_at -deleted_at';

@Injectable()
export class SentenceService {
  constructor(@InjectModel(Sentence.name) private readonly model: Model<SentenceDocument>) {}

  async create(body: CreateSentenceDto) {
    const sentence = await this.model.findOne({ sentence: body.sentence, word: body.word, translation: body.translation }).exec();

    if (sentence) return sentence;

    return this.model.create(body);
  }

  find(query: FilterQuery<SentenceDocument>) {
    return this.model.find(query).exec();
  }

  findByIds(ids: string[]) {
    return this.model
      .find({ sentence_id: { $in: ids } })
      .select(selectFields)
      .exec();
  }

  findAllPaginate(page = 1, limit = 20) {
    if (page < 1) throw new BadRequestException('Put a valid page number > 0');

    const query = this.model.find({ deleted_at: null }).select(selectFields);

    return createPaginateData(page, limit, query);
  }

  updateOneById(id: string, body: UpdateSentenceDto) {
    return this.model.updateOne({ sentence_id: id }, body).exec();
  }

  deleteOneById(id: string) {
    // TODO: Remove examples in relation with the sentence
    return this.model.updateOne({ sentence_id: id }, { deleted_at: new Date() }).exec();
  }

  getNRandomSentence(number: number, inIds?: string[]) {
    let aggregate = this.model.aggregate();

    if (inIds) aggregate = aggregate.match({ sentence_id: { $in: inIds } });

    return aggregate.sample(number);
  }
}
