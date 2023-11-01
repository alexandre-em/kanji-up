import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WordModule } from './word/word.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SentenceModule } from './sentence/sentence.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}/word?retryWrites=true&w=majority`),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_API_SECRET_KEY || 'SECRET',
        signOptions: { expiresIn: '259200s' },
      }),
    }),
    SentenceModule,
    WordModule,
  ],
})
export class AppModule {}
