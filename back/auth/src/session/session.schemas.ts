import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { util } from 'mongoose-uuid-parser';
import Permission from 'src/utils/permission.type';

@Schema()
export class Session {
  @Prop({ required: true, unique: true, default: util.v4 })
  session_id: string;

  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({
    required: true,
    expires: 0,
    type: Date,
  })
  expired_at: Date;
}

export type SessionDocument = Session & Document;
export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
