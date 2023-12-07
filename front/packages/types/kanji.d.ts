export type CharacterType = {
  character_id: string;
  character?: string;
  meaning?: Array<string>;
  onyomi?: Array<string>;
  kunyomi?: Array<string>;
  strokes?: number;
  image?: string;
};

export type RadicalType = {
  name?: {
    hiragana: string;
    romaji: string;
  };
  character?: string;
  strokes?: number;
  image?: string;
  meaning?: Array<string>;
  radical_id: string;
};

export type ReferenceType = {
  grade?: string;
  kodansha?: string;
  classic_nelson?: string;
  reference_id: string;
};

export type PredictionType = {
  score: number;
  prediction: string;
};

export type RecognitionType = {
  recognition_id: string;
  image: string;
  kanji: string;
  predictions: Array<PredictionType>;
};

export type KanjiType = {
  creation_date?: string;
  deleted_at?: string;
  kanji_id: string;
  kanji: Partial<CharacterType>;
  radical?: Partial<RadicalType>;
  reference?: Partial<ReferenceType>;
  examples?: Array<{ japanese: string; meaning: string }>;
};
