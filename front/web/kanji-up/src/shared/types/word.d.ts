type SentenceType = {
  sentence_id: string;
  word: string;
  sentence: string;
  translation: string;
  created_at: Date;
  deleted_at: Date | null;
};

type DefinitionType = {
  meaning: string[];
  type: string[];
  relation: {
    index: number;
    related_word: Partial<WordType>[];
  }[];
  example: Partial<SentenceType>[];
};

type WordType = {
  word_id: string;
  word: string[];
  reading: string[];
  definition: DefinitionType[];
};
