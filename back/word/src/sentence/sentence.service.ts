import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sentence, SentenceDocument } from './sentence.schema';
import { Model } from 'mongoose';
import { CreateSentenceDto, UpdateSentenceDto } from './sentence.dto';

@Injectable()
export class SentenceService {
  constructor(@InjectModel(Sentence.name) private readonly model: Model<SentenceDocument>) {}

  async create(body: CreateSentenceDto) {
    const sentence = await this.model.findOne({ sentence: body.sentence, word: body.word, translation: body.translation }).exec();

    if (sentence) return sentence;

    return this.model.create(body);
  }

  findOneById(id: string) {
    return this.model.findOne({ word_id: id }).exec();
  }

  updateOneById(id: string, body: UpdateSentenceDto) {
    return this.model.updateOne({ word_id: id }, body).exec();
  }

  deleteOneById(id: string) {
    return this.model.updateOne({ word_id: id }, { deleted_at: new Date() }).exec();
  }
}
