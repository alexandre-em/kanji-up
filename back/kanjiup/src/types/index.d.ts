declare module 'mongoose-uuid-parser';

type ExampleType = {
  japanese: string;
  meaning: string;
};

type ImageType = {
  filename?: string;
  contentType: string;
  data: Buffer;
};

type CharacterType = {
  id?: string;
  character_id: string;
  character: string;
  meaning: Array<string>;
  onyomi: Array<string>;
  kunyomi: Array<string>;
  strokes: number;
  image: ImageType | string;
};

type RadicalType = {
  id?: string;
  radical_id: string;
  character: string;
  strokes: number;
  image: ImageType | string;
  name: {
    hiragana: string;
    romaji: string;
  };
  meaning: Array<string>;
};

type ReferenceType = {
  id?: string;
  reference_id: string;
  grade: string;
  kodansha: string;
  classic_nelson: string;
};

type KanjiType = {
  id?: string;
  creation_date: string;
  kanji_id: string;
  kanji: CharacterType;
  radical: RadicalType;
  reference: ReferenceType;
  examples: [ExampleType];
};

type PredictionResultType = {
  prediction: string;
  confidence: number;
};

type RecognitionType = {
  image: string;
  kanji: string;
  is_valid: boolean;
  predictions: Array<PredictionResultType>;
};

type DecodedToken = {
  name: string;
  email: string;
  sub: string;
  permissions: string[];
  iat: number;
  exp: number;
};
