import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { AuthorizeAppDTO, CreateAppDTO, DeleteAppDTO, UpdateAppDTO } from './apps.dto';
import { App, AppDocument } from './apps.schema';

@Injectable()
export class AppsService {
  constructor(@InjectModel(App.name) private readonly model: Model<AppDocument>, private readonly userService: UsersService) {}

  getOne(app_id: string) {
    return this.model.findOne({ app_id }).select('-_id -__v').exec();
  }

  async createOne(user_id: string, appInfo: CreateAppDTO) {
    const user = await this.userService.getOneDetailed(user_id);

    if (!user) {
      throw new UnprocessableEntityException('This token has an unexistant user id');
    }

    return this.model.create({ ...appInfo, created_by: user });
  }

  updateOne(app_id: string, appInfo: UpdateAppDTO | AuthorizeAppDTO | DeleteAppDTO) {
    return this.model.updateOne({ app_id }, appInfo).exec();
  }
}
