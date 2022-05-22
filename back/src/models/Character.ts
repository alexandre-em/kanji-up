import { Schema, model, AggregatePaginateModel, Document } from 'mongoose';
import {util} from 'mongoose-uuid-parser';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

type CharacterModelType = {
  character_id: string;
  character: string;
  meaning: Array<string>;
  onyomi: Array<string>;
  kunyomi: Array<string>;
  strokes: number;
  image: ImageType | string;
};

const characterSchema = new Schema({
  character_id: { type: String, trim: true, unique: true, immutable: true, default: util.v4 },
  character: { type: String, required: true, index:true, unique: true },
  strokes: { type: Number, required: true },
  meaning: [String],
  onyomi: [String],
  kunyomi: [String],
  image: { type: String },
  // image: {
  //   data: Buffer,
  //   contentType: String,
  // },
});

characterSchema.plugin(mongooseAggregatePaginate);

export interface CharacterDocument extends Document, CharacterModelType {}

export default model<CharacterDocument, AggregatePaginateModel<CharacterDocument>>("Character", characterSchema);
