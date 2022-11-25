import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { util } from 'mongoose-uuid-parser';

@Schema()
export class App {
  @Prop({ required: true, unique: true, default: util.v4 })
  app_id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  platform: string;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop({ default: null })
  deleted_at: Date;

  @Prop({ default: false })
  is_autorized: boolean;
}

export type AppDocument = App & Document;
export const AppSchema = SchemaFactory.createForClass(App);
