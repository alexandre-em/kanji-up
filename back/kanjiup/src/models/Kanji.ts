import { Schema, model, Document, PaginateModel } from 'mongoose';
import { util } from 'mongoose-uuid-parser';
import mongoosePaginate from 'mongoose-paginate-v2';

type KanjiModelType = {
  kanji_id: string;
  kanji: CharacterType;
  radical: RadicalType;
  reference: ReferenceType;
  creation_date: string;
  examples: [
    {
      japanese: string;
      meaning: string;
    }
  ];
  deleted_at: string;
};

const ObjectId = Schema.Types.ObjectId;
const kanjiSchema = new Schema({
  kanji_id: { type: String, trim: true, unique: true, immutable: true, default: util.v4 },
  kanji: { type: ObjectId, ref: 'Character', required: true, unique: true },
  radical: { type: ObjectId, ref: 'Radical' },
  reference: { type: ObjectId, ref: 'Reference' },
  creation_date: Date,
  examples: [
    {
      japanese: { type: String, required: true },
      meaning: { type: String, required: true },
    },
  ],
  deleted_at: { type: Date, default: null },
});

kanjiSchema.plugin(mongoosePaginate);

export interface KanjiDocument extends Document, KanjiModelType {}

export default model<KanjiDocument, PaginateModel<KanjiDocument>>('Kanji', kanjiSchema);
