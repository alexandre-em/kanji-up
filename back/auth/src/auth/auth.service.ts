import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { RegisterDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>, private jwtService: JwtService) {}

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
          reject(new Error('The password is invalid'));
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

    return this.model.create(info);
  }

  login(user: User) {
    const payload = {
      email: user.email,
      sub: user.user_id,
      permissions: user.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
