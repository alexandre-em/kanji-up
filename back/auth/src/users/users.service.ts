import { BadRequestException, HttpException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
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
    const user = await this.model.findOne({ user_id }).select('-_id -__v -password -image -email_confirmed -permissions -applications._id').populate('friends', 'name user_id -_id').exec();

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

  async getUserFriend(user_id: string) {
    const user = await this.model
      .findOne({ user_id })
      .select('-_id -__v -password -image -email_confirmed -email -created_at -deleted_at -applications -permissions -name -user_id')
      .populate('friends', 'name user_id applications.kanji.total_score applications.word.total_score -_id')
      .exec();

    return user?.friends;
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
    if (user.friends.includes(friend._id)) {
      // throw new ''();
      throw new HttpException(
        {
          status: 409,
          error: 'Conflict',
          message: 'This user is already your friend',
        },
        409,
        {
          cause: new Error('This user is already your friend'),
        },
      );
    }

    const friends = [...user.friends, friend._id];
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
    if (!user.friends.includes(friend._id)) {
      throw new BadRequestException('This user is not your friend');
    }

    const friends = user.friends.filter((f) => !(f as any).equals(friend._id));

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

  getRanking(appType: string, limit = 10) {
    if (!appType) {
      throw new BadRequestException('Application type not specified');
    }

    switch (appType) {
      case 'kanji':
        return this.model
          .find({ $and: [{ 'applications.kanji.total_score': { $ne: null } }, { applications: { $ne: null } }] })
          .select(
            '-_id -password -email -email_confirmed -friends -permissions -created_at -__v -deleted_at -image -applications.word -applications.kanji.scores -applications.kanji.progression -applications._id',
          )
          .sort({ 'applications.kanji.total_score': -1 })
          .limit(limit)
          .exec();
      case 'word':
        return this.model
          .find({ $and: [{ 'applications.word.total_score': { $ne: null } }, { applications: { $ne: null } }] })
          .select(
            '-_id -password -email -email_confirmed -friends -permissions -created_at -__v -deleted_at -image -applications.kanji -applications.word.scores -applications.word.progression -applications._id',
          )
          .sort({ 'applications.word.total_score': -1 })
          .limit(limit)
          .exec();
      default:
        throw new BadRequestException('Invalid application type');
    }
  }
}
