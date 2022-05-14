import {Schema, model} from 'mongoose';
import {util} from 'mongoose-uuid-parser';

const radicalSchema = new Schema({
  radical_id: { type: String, unique: true, immutable: true, default: util.v4 },
  character: { type: String, required: true, index: true, unique: true },
  strokes: { type: Number, required: true },
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

