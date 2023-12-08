import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:8081',
      'http://localhost:3000',
      'https://kanjiup.alexandre-em.fr',
      'https://kanjiup-v2.alexandre-em.fr',
      'https://user.kanjiup.alexandre-em.fr',
      'https://word.kanjiup.alexandre-em.fr',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('Auth/User API')
    .setDescription('KanjiUp Auth & Users API')
    .setVersion('0.0.1')
    .addTag('Users')
    .addTag('Authentication')
    .addTag('Apps')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.set('view engine', 'hbs');

  app.use(cookieParser());

  await app.listen(parseInt(process.env.PORT || '3000'));
}
bootstrap();
