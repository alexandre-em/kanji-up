import {Schema, model} from 'mongoose';
import {util} from 'mongoose-uuid-parser';

const referenceSchema = new Schema({
  reference_id: { type: String, trim: true, unique: true, immutable: true, default: util.v4},
  grade: { type: String, required: true },
  kodansha: { type: String },
  classic_nelson: { type: String },
});

export default model("Reference", referenceSchema);
