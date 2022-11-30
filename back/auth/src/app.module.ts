import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AppsModule } from './apps/apps.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    AuthModule,
    AppsModule,
    UsersModule,
    MailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.AUTH_MONGO_URI as string),
  ],
})
export class AppModule {}
