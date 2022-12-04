import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorizeAppDTO, CreateAppDTO, DeleteAppDTO, UpdateAppDTO } from './apps.dto';
import { App, AppDocument } from './apps.schema';

@Injectable()
export class AppsService {
  constructor(@InjectModel(App.name) private readonly model: Model<AppDocument>) {}

  getOne(app_id: string) {
    return this.model.findOne({ app_id }).select('-_id -__v').exec();
  }

  createOne(appInfo: CreateAppDTO) {
    return this.model.create(appInfo);
  }

  updateOne(app_id: string, appInfo: UpdateAppDTO | AuthorizeAppDTO | DeleteAppDTO) {
    return this.model.updateOne({ app_id }, appInfo).exec();
  }
}
