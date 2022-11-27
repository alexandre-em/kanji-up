import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/users.schema';
import { AppsModule } from 'src/apps/apps.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AppsModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_API_SECRET_KEY || 'SECRET',
        signOptions: { expiresIn: '259200s' },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
