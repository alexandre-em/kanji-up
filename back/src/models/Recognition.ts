import {Schema, model} from 'mongoose';
import {util} from 'mongoose-uuid-parser';

const recognitionSchema = new Schema({
  recognition_id: { type: String, trim: true, unique: true, immutable: true, default: util.v4},
	image: { type: String, trim: true, unique: true, immutable: true, required: true },
	kanji: { type: String, trim: true, required: true },
	is_valid: { type: Boolean, trim: true },
	predictions: [{ prediction: String, confidence: Number }],
});

export default model("Recognition", recognitionSchema);
