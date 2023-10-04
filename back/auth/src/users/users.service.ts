import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Permission from 'src/utils/permission.type';
import { Readable } from 'stream';
import { DeleteUserDTO, UpdateUserAppDTO, UpdateUserDTO, UpdateUserFriendDTO, UpdateUserPermissionsDTO } from './users.dto';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  async getOne(user_id: string) {
    const user = await this.model
      .findOne({ user_id })
      .select(
        '-_id -__v -password -image -email_confirmed -applications._id -applications.kanji.scores -applications.word.scores -applications.kanji.progression -application.word.progression -permissions -friends -expireAt',
      )
      .exec();

    if (!user || user?.deleted_at) {
      throw new NotFoundException(`This user does not exist or has been deleted`);
    }

    return user;
  }

  async getOnePrivate(user_id: string) {
    const user = await this.model.findOne({ user_id }).select('-__v -password -applications._id').populate('friends', 'name user_id -_id').exec();

    if (!user || user?.deleted_at) {
      throw new NotFoundException(`This user does not exist or has been deleted`);
    }

    return user;
  }

  async getOneDetailed(user_id: string) {
    const user = await this.model.findOne({ user_id }).select('-__v -password -permissions -image -deleted_at -expireAt').exec();

    if (!user || user?.deleted_at) {
      throw new NotFoundException(`This user does not exist or has been deleted`);
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

    return { stream, length: buffer.length, type: user.image.contentType };
  }

  updateOne(user: User, userinfo: UpdateUserDTO | DeleteUserDTO) {
    if (!user) {
      throw new NotFoundException("This user doesn't exist");
    }

    return this.model.updateOne({ user_id: user.user_id }, userinfo).exec();
  }

  async uploadImage(user: User, file: any) {
    if (!user) {
      throw new NotFoundException("This user doesn't exist");
    }

    const image = {
      data: file.buffer,
      contentType: file.mimetype,
    };

    if (user.image?.data && Buffer.compare(user.image.data, image.data) === 0) {
      throw new UnprocessableEntityException('This file has already been uploaded');
    }

    return this.model.updateOne({ user_id: user.user_id }, { image }).exec();
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
        throw new ConflictException(`User already have this permissions : ${permissions.permissions}`);
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

  async getUserFollowList(user_id: string) {
    const user = await this.model.findOne({ user_id }).populate('friends', 'name user_id -_id').exec();

    if (!user) {
      throw new NotFoundException("This user doesn't exist");
    }

    return user.friends;
  }

  async getUserFollowerList(user_id: string) {
    const user = await this.model.findOne({ user_id }).exec();

    if (!user) {
      throw new NotFoundException("This user doesn't exist");
    }

    const follower = await this.model.find({ friends: user._id }).select('-_id -__v -password -image -friends -applications -email -email_confirmed -permissions -created_at -deleted_at').exec();

    return follower;
  }

  async addUserFriend(user: User, friend_id: UpdateUserFriendDTO) {
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    if (user.user_id === friend_id.user_id) {
      throw new BadRequestException("You can't add yourself as a friend");
    }

    const friend = await this.model.findOne({ user_id: friend_id.user_id }).exec();

    if (!friend) {
      throw new NotFoundException("User you want to add doesn't exist");
    }

    if (user.friends.map((f) => f.user_id).includes(friend_id.user_id)) {
      throw new ConflictException('Already your in friend list');
    }

    return this.model.updateOne({ user_id: user.user_id }, { $addToSet: { friends: friend } }).exec();
  }

  async removeUserFriend(user: User, friend_id: UpdateUserFriendDTO) {
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }

    const friend = await this.model.findOne({ user_id: friend_id.user_id }).exec();

    if (!friend) {
      throw new NotFoundException("User you want to remove doesn't exist");
    }

    if (!user.friends || !user.friends.map((f) => f.user_id).includes(friend_id.user_id)) {
      throw new BadRequestException('This user is not your friend');
    }

    const updatedField = user.friends.length > 0 ? { $pull: { friends: friend._id } } : { $unset: { friends: 1 } };

    return this.model.updateOne({ user_id: user.user_id }, updatedField).exec();
  }

  async updateUserApp(user: User, appType: string, body: UpdateUserAppDTO) {
    if (!appType) {
      throw new BadRequestException('Application type not specified');
    }

    const { user_id } = user;

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

  searchUser(query: string) {
    return this.model
      .aggregate()
      .search({
        index: 'userIndex',
        text: {
          query,
          path: {
            wildcard: '*',
          },
        },
      })
      .match({ deleted_at: null })
      .project({
        _id: 0,
        password: 0,
        email_confirmed: 0,
        friends: 0,
        permissions: 0,
        deleted_at: 0,
        image: 0,
        applications: 0,
        __v: 0,
      })
      .exec();
  }
}
