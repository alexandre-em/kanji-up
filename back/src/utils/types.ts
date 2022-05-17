export type ExampleType = {
  japanese: string,
  meaning: string,
};

export type ImageType = {
  filename?: string,
  contentType: string;
  data: Buffer;
}

export type CharacterType = {
  id?: string,
  character_id: string;
  character: string;
  meaning: Array<string>;
  onyomi: Array<string>;
  kunyomi: Array<string>;
  strokes: number;
  image: ImageType | string;
};

export type RadicalType = {
  id?: string,
  radical_id: string,
  character: string,
  strokes: number,
  image: ImageType | string,
  name: {
    hiragana: string,
    romaji: string,
  },
  meaning: Array<string>,
};

export type ReferenceType = {
  id?: string,
  reference_id: string,
  grade: string,
  kodansha: string,
  classic_nelson: string,
};

export type KanjiType = {
  id?: string,
  creation_date: string,
  kanji_id: string,
  kanji: CharacterType,
  radical: RadicalType,
  reference: ReferenceType,
  examples: [ExampleType],
};
