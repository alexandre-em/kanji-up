import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionController } from './session.controller';
import { Session, SessionSchema } from './session.schemas';
import { SessionService } from './session.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, JwtService],
  imports: [MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }])],
  exports: [SessionService],
})
export class SessionModule {}
