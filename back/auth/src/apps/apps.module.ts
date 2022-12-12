import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { AppsController } from './apps.controller';
import { App, AppSchema } from './apps.schema';
import { AppsService } from './apps.service';

@Module({
  controllers: [AppsController],
  providers: [AppsService, JwtService],
  imports: [UsersModule, MongooseModule.forFeature([{ name: App.name, schema: AppSchema }])],
  exports: [AppsService],
})
export class AppsModule {}
