import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { util } from 'mongoose-uuid-parser';

@Schema()
export class Sentence {
  @Prop({ required: true, unique: true, default: util.v4 })
  sentence_id: string;

  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  sentence: string;

  @Prop({ required: true })
  translation: string;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop({ default: null })
  deleted_at: Date;
}

export type SentenceDocument = Sentence & Document;
export const SentenceSchema = SchemaFactory.createForClass(Sentence);
