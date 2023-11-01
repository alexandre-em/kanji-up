import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Sentence, SentenceSchema } from './sentence.schema';
import { SentenceController } from './sentence.controller';
import { SentenceService } from './sentence.service';

@Module({
  controllers: [SentenceController],
  providers: [SentenceService],
  imports: [MongooseModule.forFeature([{ name: Sentence.name, schema: SentenceSchema }])],
  exports: [SentenceService],
})
export class SentenceModule {}
