export type CharacterType = {
    character_id: string;
    character: string;
    meaning: Array<string>;
    onyomi: Array<string>;
    kunyomi: Array<string>;
    strokes: number;
    image: {
        contentType: string;
        data: Buffer;
    };
};

export type RadicalType = {
  radical_id: string,
  character: string,
  stroke: number,
  image: {
    data: Buffer,
    contentType: string,
  },
  name: {
    hiragana: string,
    romaji: string,
  },
  meaning: [string],
};

export type ReferenceType = {
  reference_id: string,
  grade: string,
  kodansha: string,
  classic_nelson: string,
};

export type KanjiType = {
  kanji_id: string,
  kanji: CharacterType,
  radical: RadicalType,
  reference: ReferenceType,
  creation_date: string,
  examples: {
    japanese: string,
    meaning: string,
  },
};
