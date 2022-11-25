import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppsController } from './apps.controller';
import { App, AppSchema } from './apps.schema';
import { AppsService } from './apps.service';

@Module({
  controllers: [AppsController],
  providers: [AppsService],
  imports: [MongooseModule.forFeature([{ name: App.name, schema: AppSchema }])],
  exports: [AppsService],
})
export class AppsModule {}
