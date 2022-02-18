import {Schema, model} from 'mongoose';
import {uuid} from '../utils';

const ObjectId = Schema.Types.ObjectId;
const kanjiSchema = new Schema({
  kanji_id: { type: String, trim: true, unique: true, immutable: true, default: uuid() },
  kanji: { type: ObjectId, ref: 'Character', required: true, unique: true },
  radical: { type: ObjectId, ref: 'Radical' },
  reference: { type: ObjectId, ref: 'Reference' },
  creation_date: Date,
  examples: [{
    japanese: { type: String, required: true },
    meaning: { type: String, required: true },
  }]
});

export default model("Kanji", kanjiSchema);

