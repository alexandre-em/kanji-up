import {Schema, model} from 'mongoose';
import {uuid} from '../utils';

const radicalSchema = new Schema({
  radical_id: { type: String, unique: true, immutable: true, default: uuid() },
  character: { type: String, required: true, index: true },
  stroke: { type: Number, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
  name: {
    hiragana: { type: String, required: true },
    romaji: { type: String },
  },
  meaning: [String],
});

export default model("Radical", radicalSchema);

