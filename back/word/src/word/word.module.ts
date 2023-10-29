import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WordController } from './word.controller';
import { WordService } from './word.service';
import { Word, WordSchema } from './word.schema';
import { SentenceModule } from '../sentence/sentence.module';

@Module({
  controllers: [WordController],
  providers: [WordService],
  imports: [SentenceModule, MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }])],
})
export class WordModule {}
