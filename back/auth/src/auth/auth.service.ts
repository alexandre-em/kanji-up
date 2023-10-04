import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { MailService } from '../mail/mail.service';
import { RegisterDTO } from './auth.dto';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthService {
  private _privateKey = process.env.AUTH_API_SECRET_KEY || 'SECRET';

  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>, private jwtService: JwtService, private mailService: MailService, private sessionService: SessionService) {}

  async validateUser(email: string, password: string) {
    const user: User | null = await this.model.findOne({ email }).exec();

    if (!user) {
      throw new UnauthorizedException('The username does not exist');
    }

    if (user.deleted_at) {
      throw new UnauthorizedException(`This user as been deleted : ${user.deleted_at}`);
    }

    if (user.email_confirmed !== null && !user.email_confirmed) {
      throw new UnauthorizedException('Please confirm your email !');
    }

    return new Promise((resolve, reject) => {
      (user as any).comparePassword(password, (error: Error, match: boolean) => {
        if (error) {
          reject(error);
        }
        if (!match) {
          reject(new UnauthorizedException('The email/password is invalid'));
        }
        resolve(user);
      });
    });
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const user = await this.model.findOne({ email }).exec();

    if (user && !user.deleted_at) {
      throw new ConflictException('This user already exist');
    }

    if (user && user.deleted_at) {
      return user.update({ deleted_at: null, expireAt: null });
    }

    const info: RegisterDTO = {
      name,
      email,
      password,
      created_at: new Date(),
    };

    const createdUser = await this.model.create(info);

    const token = this.jwtService.sign({ id: createdUser.user_id, confirmed: createdUser.email_confirmed }, { privateKey: this._privateKey, expiresIn: '1d' });

    const url = `${process.env.AUTH_BASE_URL}/auth/confirmation?token=${token}`;
    this.mailService.sendMail(email, name, url);

    return createdUser;
  }

  confirmEmail(token: string) {
    const userInfo = this.jwtService.verify(token);

    if (userInfo.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('This token is expired.');
    }

    return this.model.updateOne({ user_id: userInfo.id }, { email_confirmed: true }).exec();
  }

  async login(user: User) {
    if (!user.email_confirmed) {
      throw new UnauthorizedException('Please confirm your email');
    }

    const oldSession = await this.sessionService.getUserToken(user.user_id);

    if (oldSession !== null) {
      const isValidToken = this.jwtService.verify(oldSession.token);

      if (isValidToken) {
        return {
          access_token: oldSession.token,
        };
      }
    }

    const payload = {
      name: user.name,
      email: user.email,
      sub: user.user_id,
      permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload, { privateKey: this._privateKey, expiresIn: '259200s' });

    await this.sessionService.createSession(accessToken);

    return {
      access_token: accessToken,
    };
  }

  async sendEmailReset(email: string) {
    const user = await this.model.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const token = this.jwtService.sign({ sub: user.user_id }, { expiresIn: '1d' });

    const url = `${process.env.AUTH_BASE_URL}/auth/reset/token?token=${token}`;

    this.mailService.sendMail(email, user.name, url);

    return user;
  }

  async newPassword(token: string, email: string, password: string) {
    const decodedToken: DecodedToken = this.jwtService.verify(token);

    if (decodedToken.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('This token is expired.');
    }

    const user = await this.model.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (user.user_id !== decodedToken.sub) {
      throw new BadRequestException('The token is not valid with this email');
    }

    return this.model.updateOne({ user_id: user.user_id }, { password }).exec();
  }

  checkJwt(token: string) {
    try {
      const decodedToken: DecodedToken = this.jwtService.verify(token);

      return decodedToken.exp && decodedToken.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  }

  logout(token: string) {
    if (!token) {
      return;
    }

    return this.sessionService.removeSession(token);
  }
}
