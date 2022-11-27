import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeleteUserDTO, UpdateUserDTO, UpdateUserFriendDTO } from './users.dto';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  getOne(user_id: string) {
    return this.model.findOne({ user_id }).exec();
  }

  updateOne(user_id: string, userinfo: UpdateUserDTO | DeleteUserDTO) {
    return this.model.updateOne({ user_id }, userinfo).exec();
  }

  async addUserFriend(user_id: string, friend_id: UpdateUserFriendDTO) {
    if (user_id === friend_id.user_id) {
      throw new Error("You can't yourself as a friend");
    }
    const user = await this.model.findOne({ user_id }).exec();
    const friend = await this.model
      .findOne({ user_id: friend_id.user_id })
      .exec();
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
    const friend = await this.model
      .findOne({ user_id: friend_id.user_id })
      .exec();
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
