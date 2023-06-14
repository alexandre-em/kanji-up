import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AppsModule } from './apps/apps.module';
import { MailModule } from './mail/mail.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    AuthModule,
    AppsModule,
    UsersModule,
    MailModule,
    SessionModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}/user?retryWrites=true&w=majority`),
  ],
})
export class AppModule {}
