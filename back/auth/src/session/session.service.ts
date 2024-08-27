import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './session.schemas';

@Injectable()
export class SessionService {
  _secret: string;
  constructor(@InjectModel(Session.name) private readonly model: Model<SessionDocument>, private readonly jwtService: JwtService) {
    this._secret = process.env.AUTH_API_SECRET_KEY || 'SECRET';
  }

  async checkTokenValidity(token: string) {
    if (!token) {
      return false;
    }

    const session = await this.model.findOne({ token }).exec();

    return session !== null;
  }

  getUserToken(user_id: string) {
    if (!user_id) {
      return null;
    }

    return this.model.findOne({ user_id }).exec();
  }

  getSessions(limit = 10) {
    return this.model.find().select('-_id -token -__v').limit(limit).exec();
  }

  async createSession(token: string) {
    if (!token) {
      throw new UnauthorizedException('Please authenticate');
    }

    try {
      const decodedToken: DecodedToken = this.jwtService.verify(token, { secret: this._secret });

      const hasOldSession = await this.model.findOne({ user_id: decodedToken.sub }).exec();

      if (hasOldSession) {
        throw new BadRequestException('This user has already an openned session');
      }

      return this.model.create({
        user_id: decodedToken.sub,
        token,
        expired_at: new Date(decodedToken.exp * 1000),
      });
    } catch (e) {
      throw new UnauthorizedException('The token is invalid', e);
    }
  }

  async removeSession(token: string) {
    if (!token) {
      throw new UnauthorizedException('Please authenticate');
    }

    try {
      const decodedToken: DecodedToken = this.jwtService.verify(token, { secret: this._secret });

      return this.model.deleteOne({ user_id: decodedToken.sub }).exec();
    } catch (e) {
      throw new UnauthorizedException('The token is invalid', e);
    }
  }
}
