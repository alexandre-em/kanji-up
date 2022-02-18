import {Schema, model} from 'mongoose';
import {uuid} from '../utils';

const referenceSchema = new Schema({
  reference_id: { type: String, trim: true, unique: true, immutable: true, default: uuid()},
  grade: { type: String, required: true },
  kodansha: { type: String },
  classic_nelson: { type: String },
});

export default model("Reference", referenceSchema);

