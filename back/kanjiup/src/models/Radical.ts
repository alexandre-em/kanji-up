import { Schema, model, Document, PaginateModel } from 'mongoose';
import { util } from 'mongoose-uuid-parser';
import mongoosePaginate from 'mongoose-paginate-v2';

type RadicalModelType = {
  radical_id: string;
  character: string;
  strokes: number;
  image: ImageType | string;
  name: {
    hiragana: string;
    romaji: string;
  };
  meaning: Array<string>;
};

const radicalSchema = new Schema({
  radical_id: { type: String, unique: true, immutable: true, default: util.v4 },
  character: { type: String, required: true, index: true, unique: true },
  strokes: { type: Number, required: true },
  image: { type: String },
  // image: {
  //   data: Buffer,
  //   contentType: String,
  // },
  name: {
    hiragana: { type: String, required: true },
    romaji: { type: String },
  },
  meaning: [String],
});

radicalSchema.plugin(mongoosePaginate);

export interface RadicalDocument extends Document, RadicalModelType {}

export default model<RadicalDocument, PaginateModel<RadicalDocument>>('Radical', radicalSchema);
