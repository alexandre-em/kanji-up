import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError, Document } from 'mongoose';
import { util } from 'mongoose-uuid-parser';
import * as bcrypt from 'bcryptjs';
import Permission from 'src/utils/permission.type';

@Schema()
export class User {
  @Prop({ required: true, unique: true, default: util.v4 })
  user_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: false })
  email_confirmed: boolean;

  @Prop({ type: { data: Buffer, contentType: String } })
  image: {
    data: Buffer;
    contentType: string;
  };

  @Prop({ default: [] })
  applications: {
    app_id: string;
    total_score: number;
    scores: { [key: string]: Date };
  }[];

  @Prop()
  friends: User[];

  @Prop()
  permissions: Permission[];

  @Prop({ required: true })
  created_at: Date;

  @Prop({ default: null })
  deleted_at: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('updateOne', function (next: CallbackWithoutResultAndOptionalError) {
  const password = (this.getUpdate() as any).password;

  if (!password) {
    return next();
  }
  const newPassword = bcrypt.hashSync(password);
  (this.getUpdate() as any).password = newPassword;
  next();
});

// Crypt the password before saving on the database then save the crypted password
UserSchema.pre('save', function (next: CallbackWithoutResultAndOptionalError) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password);
  next();
});

UserSchema.methods.comparePassword = function (plaintext: string, callback: any) {
  return callback(null, bcrypt.compareSync(plaintext, this.password));
};

UserSchema.path('email').validate(function (email: string) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  return emailRegex.test(email);
}, 'The email format is incorrect');
