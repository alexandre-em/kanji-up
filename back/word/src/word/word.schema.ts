import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { util } from 'mongoose-uuid-parser';

import { Sentence } from '../sentence/sentence.schema';

@Schema()
export class WordRelation extends Document {
  @Prop({ required: false, type: Number })
  index: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: false }] })
  related_word: Word[];
}
export const WordRelationSchema = SchemaFactory.createForClass(WordRelation);

@Schema()
export class Definition extends Document {
  @Prop({ required: true, type: [String] })
  meaning: string[];

  @Prop({ type: String })
  description: string;

  @Prop({ type: [String] })
  type: string[];

  @Prop({ type: [String] })
  related_word: string[]; // raw version

  @Prop({ type: [WordRelationSchema] })
  relation: WordRelation[]; // formated version with relationship

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sentence', required: false }] })
  example: Sentence[];
}
export const DefinitionSchema = SchemaFactory.createForClass(Definition);

@Schema()
export class Word {
  @Prop({ required: true, unique: true, default: util.v4 })
  word_id: string;

  @Prop({ type: [String] })
  word: string[];

  @Prop({ type: [String] })
  reading: string[];

  @Prop({
    required: true,
    type: [DefinitionSchema],
    default: [],
  })
  definition: Array<{
    meaning: string[];
    description: string;
    type: string[];
    related_word: string[];
    relation: {
      index: number | null;
      related_word: Word;
    }[];
    example: Sentence[];
  }>;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop({ default: null })
  deleted_at: Date;
}

export type WordDocument = Word & Document;
export const WordSchema = SchemaFactory.createForClass(Word);
