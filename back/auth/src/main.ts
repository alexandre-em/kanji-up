import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  await app.listen(parseInt(process.env.PORT || '3000'));
}
bootstrap();
