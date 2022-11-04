type CharacterType = {
  character_id: string,
  character?: string,
  meaning?: Array<string>,
  onyomi?: Array<string>,
  kunyomi?: Array<string>,
  strokes?: number,
  image?: string,
};

type RadicalType = {
  name?: {
    hiragana: string,
    romaji: string,
  },
  character?: string,
  strokes?: number,
  image?: string,
  meaning?: Array<string>,
  radical_id: string,
};

type ReferenceType = {
  grade?: string,
  kodansha?: string,
  classic_nelson?: string,
  reference_id: string,
};

type PredictionType = { 
  confidence: number, 
  prediction: string,
};

type RecognitionType = {
  recognition_id: string,
  image: string,
  kanji: string,
  predictions: Array<PredictionType>,
  is_valid?: boolean,
};

type KanjiType = {
  creation_date?: string,
  deleted_at?: string,
  kanji_id: string,
  kanji: Partial<CharacterType>,
  radical?: Partial<RadicalType>,
  reference?: Partial<ReferenceType>,
  examples?: Array<{ japanese: string, meaning: string }>,
};

interface Pagination<T> {
  docs: Array<T>,
  totalDocs: number,
  limit: number,
  totalPages: number,
  page: number,
  pagingCounter: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  prevPage: number | null,
  nextPage: number | null,
};
