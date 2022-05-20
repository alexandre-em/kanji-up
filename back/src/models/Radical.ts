import { Schema, model, Document, PaginateModel } from 'mongoose';
import {util} from 'mongoose-uuid-parser';
import mongoosePaginate from 'mongoose-paginate-v2';

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

interface RadicalDocument<T extends Document> extends PaginateModel<T> {}

export default model("Radical", radicalSchema);

