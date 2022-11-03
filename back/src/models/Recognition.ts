import {Schema, model, Document, PaginateModel} from 'mongoose';
import {util} from 'mongoose-uuid-parser';
import mongoosePaginate from 'mongoose-paginate-v2';

type RecognitionModelType = {
  recognition_id: string,
  image: string,
  kanji: string,
  is_valid: boolean,
  predictions: [{ prediction: string, confidence: number }],
};

const recognitionSchema = new Schema({
  recognition_id: { type: String, trim: true, unique: true, immutable: true, default: util.v4},
	image: { type: String, trim: true, unique: true, immutable: true, required: true },
	kanji: { type: String, trim: true, required: true },
	is_valid: { type: Boolean, trim: true },
	predictions: [{ prediction: String, confidence: Number }],
});

recognitionSchema.plugin(mongoosePaginate);

export interface RecognitionDocument extends Document, RecognitionModelType {}

export default model<RecognitionDocument, PaginateModel<RecognitionDocument>>("Recognition", recognitionSchema);
