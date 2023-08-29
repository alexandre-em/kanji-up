import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel, Prop } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Permission from 'src/utils/permission.type';
import { Readable } from 'stream';
import { DeleteUserDTO, UpdateUserAppDTO, UpdateUserDTO, UpdateUserFriendDTO, UpdateUserPermissionsDTO } from './users.dto';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  async getOne(user_id: string) {
    const user = await this.model.findOne({ user_id }).select('-_id -__v -password -image -email_confirmed').exec();

    if (user?.deleted_at) {
      throw new NotFoundException(`This user has been deleted at: ${user.deleted_at}`);
    }

    return user;
  }

  async getOneDetailed(user_id: string) {
    const user = await this.model.findOne({ user_id }).select('-__v -password -image').exec();

    if (user?.deleted_at) {
      throw new NotFoundException(`This user has been deleted at: ${user.deleted_at}`);
    }

    return user;
  }

  async getOneImage(user_id: string) {
    const user = await this.model.findOne({ user_id }).exec();

    if (!user) {
      throw new NotFoundException("This user doesn't exist");
    }
    if (!user.image && !(user as User).image.data) {
      throw new NotFoundException('This user does not have image profile');
    }

    const buffer = user.image.data;
    const stream = new Readable();

    stream.push(buffer);
    stream.push(null);

    return { stream, length: buffer.length };
  }

  updateOne(user_id: string, userinfo: UpdateUserDTO | DeleteUserDTO) {
    return this.model.updateOne({ user_id }, userinfo).exec();
  }

  async uploadImage(user_id: string, file: any) {
    const user = await this.model.findOne({ user_id }).exec();

    if (!user) {
      throw new NotFoundException("This user doesn't exist");
    }

    const image = {
      data: file.buffer,
      contentType: file.mimetype,
    };

    if (Buffer.compare(user.image.data, image.data) === 0) {
      throw new UnprocessableEntityException('This file has already been uploaded');
    }

    return this.model.updateOne({ user_id }, { image }).exec();
  }

  async addUserPermissions(user_id: string, permissions: UpdateUserPermissionsDTO) {
    const user = await this.model.findOne({ user_id }).exec();
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    const updatedPermissions = [...user.permissions];

    if (!permissions || !permissions.permissions) {
      throw new BadRequestException('There are no permissions on the body of the request');
    }
    if (!Array.isArray(permissions.permissions)) {
      if (user.permissions.includes(permissions.permissions)) {
        throw new UnprocessableEntityException(`User already have this permissions : ${permissions.permissions}`);
      }
      updatedPermissions.push(permissions.permissions as Permission);
    } else {
      (permissions.permissions as Permission[]).forEach((p: Permission) => {
        if (!user.permissions.includes(p)) {
          updatedPermissions.push(p);
        }
      });
    }

    return this.model.updateOne({ user_id }, { permissions: updatedPermissions }).exec();
  }

  async removeUserPermissions(user_id: string, permissions: UpdateUserPermissionsDTO) {
    const user = await this.model.findOne({ user_id }).exec();
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    if (!permissions || !permissions.permissions) {
      throw new BadRequestException('There are no permissions on the body of the request');
    }
    if (!Array.isArray(permissions.permissions)) {
      if (!user.permissions.includes(permissions.permissions)) {
        throw new NotFoundException(`User doesn't have this permissions : ${permissions.permissions}`);
      }
      const updatedPermissions = user.permissions.filter((p) => p !== permissions.permissions);
      return this.model.updateOne({ user_id }, { permissions: updatedPermissions }).exec();
    } else {
      (permissions.permissions as Permission[]).forEach((p: Permission) => {
        if (user.permissions.includes(p)) {
          const updatedPermissions: string[] = user.permissions.filter((p) => p === permissions.permissions);

          return this.model.updateOne({ user_id }, { permissions: updatedPermissions }).exec();
        }
      });
      const updatedPermissions = [...user.permissions, permissions.permissions.filter((p) => !user.permissions.includes(p))];

      return this.model.updateOne({ user_id }, { permissions: updatedPermissions }).exec();
    }
  }

  async addUserFriend(user_id: string, friend_id: UpdateUserFriendDTO) {
    if (user_id === friend_id.user_id) {
      throw new BadRequestException("You can't add yourself as a friend");
    }
    const user = await this.model.findOne({ user_id }).exec();
    const friend = await this.model.findOne({ user_id: friend_id.user_id }).exec();
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }
    if (!friend) {
      throw new NotFoundException("User you want to add doesn't exist");
    }
    if (user.friends.includes(friend)) {
      throw new UnprocessableEntityException('This user is already your friend');
    }

    const friends = [...user.friends, friend];
    return this.model.updateOne({ user_id }, { friends }).exec();
  }

  async removeUserFriend(user_id: string, friend_id: UpdateUserFriendDTO) {
    const user = await this.model.findOne({ user_id }).exec();
    const friend = await this.model.findOne({ user_id: friend_id.user_id }).exec();
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }
    if (!friend) {
      throw new NotFoundException("User you want to remove doesn't exist");
    }
    if (!user.friends.includes(friend)) {
      throw new UnprocessableEntityException('This user is not your friend');
    }

    const friends = user.friends.filter((f) => f !== friend);
    return this.model.updateOne({ user_id }, { friends }).exec();
  }

  async updateUserApp(user_id: string, appType: string, body: UpdateUserAppDTO) {
    if (!appType) {
      throw new BadRequestException('Application type not specified');
    }

    switch (appType) {
      case 'kanji':
        return this.model.updateOne({ user_id }, { 'applications.kanji': body }).exec();
      case 'word':
        return this.model.updateOne({ user_id }, { 'applications.word': body }).exec();
      default:
        throw new BadRequestException('Invalid application type');
    }
  }
}
