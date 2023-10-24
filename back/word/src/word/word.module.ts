import { Module } from '@nestjs/common';
import { WordController } from './word.controller';
import { WordService } from './word.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './word.schema';

@Module({
  controllers: [WordController],
  providers: [WordService],
  imports: [MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }])],
})
export class WordModule {}
