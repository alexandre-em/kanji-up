import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeleteUserDTO, UpdateUserDTO, UpdateUserFriendDTO, UpdateUserPermissionsDTO } from './users.dto';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  getOne(user_id: string) {
    return this.model.findOne({ user_id }).exec();
  }

  updateOne(user_id: string, userinfo: UpdateUserDTO | DeleteUserDTO) {
    return this.model.updateOne({ user_id }, userinfo).exec();
  }

  async uploadImage(user_id: string, file: any) {
    const user = await this.model.findOne({ user_id }).exec();

    if (!user) {
      throw new Error("This user doesn't exist");
    }

    const image = {
      data: file.buffer,
      contentType: file.mimetype,
    };

    if (Buffer.compare(user.image.data, image.data) === 0) {
      throw new Error("This file has already been uploaded");
    }

    return this.model.updateOne({ user_id }, { image }).exec();
  }

  async addUserPermissions(user_id: string, permissions: UpdateUserPermissionsDTO) {
    const user = await this.model.findOne({ user_id }).exec();
    if (!user) {
      throw new Error("User doesn't exist");
    }

    const updatedPermissions = [...user.permissions];

    if (!permissions || !permissions.permissions) {
      throw new Error('There are no permissions on the body of the request');
    }
    if (!Array.isArray(permissions.permissions)) {
      if (user.permissions.includes(permissions.permissions)) {
        throw new Error(`User already have this permissions : ${permissions.permissions}`);
      }
      updatedPermissions.push(permissions.permissions as string);
    } else {
      (permissions.permissions as string[]).forEach((p: string) => {
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
      throw new Error("User doesn't exist");
    }

    if (!permissions || !permissions.permissions) {
      throw new Error('There are no permissions on the body of the request');
    }
    if (!Array.isArray(permissions.permissions)) {
      if (!user.permissions.includes(permissions.permissions)) {
        throw new Error(`User doesn't have this permissions : ${permissions.permissions}`);
      }
      const updatedPermissions = user.permissions.filter((p) => p !== permissions.permissions);
      return this.model.updateOne({ user_id }, { permissions: updatedPermissions }).exec();
    } else {
      (permissions.permissions as string[]).forEach((p: string) => {
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
      throw new Error("You can't yourself as a friend");
    }
    const user = await this.model.findOne({ user_id }).exec();
    const friend = await this.model.findOne({ user_id: friend_id.user_id }).exec();
    if (!user) {
      throw new Error("User doesn't exist");
    }
    if (!friend) {
      throw new Error("User you want to add doesn't exist");
    }
    if (user.friends.includes(friend)) {
      throw new Error('This user is already your friend');
    }

    const friends = [...user.friends, friend];
    return this.model.updateOne({ user_id }, { friends }).exec();
  }

  async removeUserFriend(user_id: string, friend_id: UpdateUserFriendDTO) {
    const user = await this.model.findOne({ user_id }).exec();
    const friend = await this.model.findOne({ user_id: friend_id.user_id }).exec();
    if (!user) {
      throw new Error("User doesn't exist");
    }
    if (!friend) {
      throw new Error("User you want to remove doesn't exist");
    }
    if (!user.friends.includes(friend)) {
      throw new Error('This user is not your friend');
    }

    const friends = user.friends.filter((f) => f !== friend);
    return this.model.updateOne({ user_id }, { friends }).exec();
  }
}
