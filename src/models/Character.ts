import { Schema, model } from 'mongoose';
import {util} from 'mongoose-uuid-parser';
import { uuid } from '../utils';

const characterSchema = new Schema({
  character_id: { type: String, trim: true, unique: true, immutable: true, default: util.v4 },
  character: { type: String, required: true, index:true, unique: true },
  strokes: { type: Number, required: true },
  meaning: [String],
  onyomi: [String],
  kunyomi: [String],
  image: {
    data: Buffer,
    contentType: String,
  },
});

export default model("Character", characterSchema);
