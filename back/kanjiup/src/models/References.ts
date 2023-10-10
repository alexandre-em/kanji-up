import { Schema, model } from 'mongoose';
import { util } from 'mongoose-uuid-parser';

type ReferenceModelType = {
  reference_id: string;
  grade: string;
  kodansha: string;
  classic_nelson: string;
};

const referenceSchema = new Schema({
  reference_id: { type: String, trim: true, unique: true, immutable: true, default: util.v4 },
  grade: { type: String, required: true },
  kodansha: { type: String },
  classic_nelson: { type: String },
});

export interface ReferenceDocument extends Document, ReferenceModelType {}

export default model('Reference', referenceSchema);
