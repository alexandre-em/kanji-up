import { Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { MailService } from 'src/mail/mail.service';
import { RegisterDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>, private jwtService: JwtService, private mailService: MailService) {}

  async validateUser(email: string, password: string) {
    const user = await this.model.findOne({ email }).exec();

    if (!user) {
      throw new UnauthorizedException('The username does not exist');
    }

    if (user.deleted_at) {
      throw new UnauthorizedException(`This user as been deleted : ${user.deleted_at}`);
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
      throw new Error('This user already exist');
    }

    if (user && user.deleted_at) {
      return user.update({ deleted_at: null });
    }

    const info: RegisterDTO = {
      name,
      email,
      password,
      created_at: new Date(),
    };

    const createdUser = await this.model.create(info);

    const token = this.jwtService.sign({ id: createdUser.user_id, confirmed: createdUser.email_confirmed }, { expiresIn: '1d' });

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

  login(user: User) {
    if (!user.email_confirmed) {
      throw new UnauthorizedException('Please confirm your email');
    }

    const payload = {
      email: user.email,
      sub: user.user_id,
      permissions: user.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendEmailReset(email: string) {
    const user = await this.model.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const token = this.jwtService.sign({ id: user.user_id }, { expiresIn: '1d' });

    const url = `${process.env.AUTH_BASE_URL}/auth/reset/token?token=${token}`;

    this.mailService.sendMail(email, user.name, url);

    return user;
  }

  async newPassword(token: string, email: string, password: string) {
    const decodedToken = this.jwtService.verify(token);

    if (decodedToken.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('This token is expired.');
    }

    const user = await this.model.findOne({ email }).exec();

    if (!user || user.user_id !== decodedToken.id) {
      throw new UnprocessableEntityException('The token is not valid with this email');
    }

    return this.model.updateOne({ user_id: user.user_id }, { password }).exec();
  }
}
