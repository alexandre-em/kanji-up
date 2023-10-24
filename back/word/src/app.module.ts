import { Module } from '@nestjs/common';
import { WordModule } from './word/word.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SentenceModule } from './sentence/sentence.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forRoot(`${process.env.MONGO_URI}/word?retryWrites=true&w=majority`), SentenceModule, WordModule],
})
export class AppModule {}
