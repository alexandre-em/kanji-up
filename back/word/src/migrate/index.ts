import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { WordService } from '../word/word.service';
import { SentenceService } from '../sentence/sentence.service';
import { migrate } from './generateDataMigration';
import { completeMigration } from './completeDataMigration';

async function generateWordsData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const wordService = app.get(WordService);
  const sentenceService = app.get(SentenceService);

  try {
    console.log('Adding fetched data into MongoDB...');
    //
    await migrate(wordService, sentenceService);
    await completeMigration(wordService);
    //
    console.log('\n Migration has been completed !!');
  } catch (e) {
    console.error(e);
  } finally {
    await app.close();
    process.exit(0);
  }
}

generateWordsData();
