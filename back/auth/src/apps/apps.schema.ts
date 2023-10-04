import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { util } from 'mongoose-uuid-parser';

import { User } from '../users/users.schema';

@Schema()
export class App {
  @Prop({ required: true, unique: true, default: util.v4 })
  app_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  redirection_url: string;

  @Prop()
  platform: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  created_by: User;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop({ default: null })
  deleted_at: Date;

  @Prop({ default: false })
  is_autorized: boolean;
}

export type AppDocument = App & Document;
export const AppSchema = SchemaFactory.createForClass(App);
