import {
  computeSlotStatus,
  computeWordProgressionDeltas,
  filterWordsWithKanji,
  getExpectedCharacterOptions,
  getKanjiCharacters,
  sampleWords,
  WordEvaluationItemType,
  WordSlotType,
} from './wordEvaluation';

describe('getKanjiCharacters', () => {
  it('extracts every kanji from a word', () => {
    expect(getKanjiCharacters('辞書')).toEqual(['辞', '書']);
  });

  it('drops kana, keeping only kanji', () => {
    expect(getKanjiCharacters('お寿司')).toEqual(['寿', '司']);
  });

  // 々 isn't a real kanji — it repeats whichever one came right before it
  it('resolves the iteration mark to a repeat of the preceding kanji', () => {
    expect(getKanjiCharacters('前々')).toEqual(['前', '前']);
  });

  it('ignores a leading iteration mark with nothing to repeat', () => {
    expect(getKanjiCharacters('々')).toEqual([]);
  });
});

const word = (id: string, spelling = id): WordType =>
  ({ word_id: id, word: [spelling], reading: [], definition: [] }) as unknown as WordType;

describe('filterWordsWithKanji', () => {
  it('keeps only words whose primary spelling contains a kanji', () => {
    const words = [word('a', 'ひらがな'), word('b', '漢字'), word('c', 'カタカナ'), word('d', '力')];

    const result = filterWordsWithKanji(words);

    expect(result.map((w) => w.word_id)).toEqual(['b', 'd']);
  });
});

describe('sampleWords', () => {
  it('repeats words to fill the count when the list is shorter', () => {
    const words = [word('a'), word('b')];

    const result = sampleWords(words, 5);

    expect(result).toHaveLength(5);
    result.forEach((w) => expect(words).toContain(w));
  });

  it('trims down to exactly the requested count', () => {
    const words = [word('a'), word('b'), word('c'), word('d'), word('e')];

    const result = sampleWords(words, 3);

    expect(result).toHaveLength(3);
  });

  it('never duplicates or invents entries', () => {
    const words = [word('a'), word('b'), word('c'), word('d'), word('e')];

    const result = sampleWords(words, 3);

    expect(new Set(result.map((w) => w.word_id)).size).toBe(3);
    result.forEach((w) => expect(words).toContain(w));
  });
});

const slot = (overrides: Partial<WordSlotType> = {}): WordSlotType => ({
  image: 'data:image/png;base64,x',
  predictions: [{ label: '力', confidence: 0.9 }],
  strokesCount: 2,
  ...overrides,
});

describe('computeSlotStatus', () => {
  it('is correct when every slot matches its expected character and stroke count', () => {
    const status = computeSlotStatus([slot()], [['力']], { 力: 2 });

    expect(status).toBe('correct');
  });

  it('is incorrect when a slot was left empty', () => {
    const status = computeSlotStatus([slot({ image: null, strokesCount: 0 })], [['力']], { 力: 2 });

    expect(status).toBe('incorrect');
  });

  it('is incorrect on a wrong stroke count when the expected count is known', () => {
    const status = computeSlotStatus([slot({ strokesCount: 5 })], [['力']], { 力: 2 });

    expect(status).toBe('incorrect');
  });

  // The bug this whole function was extracted to fix: a character whose stroke count couldn't be
  // resolved (not in strokesByCharacter) must not be treated as wrong — it's unknown, not invalid
  it('does not fail the stroke check for a character with no known expected count', () => {
    const status = computeSlotStatus([slot({ strokesCount: 999 })], [['力']], {});

    expect(status).toBe('correct');
  });

  it('is review when the drawing does not match the expected character, everything else fine', () => {
    const status = computeSlotStatus([slot({ predictions: [{ label: '人', confidence: 0.9 }] })], [['力']], { 力: 2 });

    expect(status).toBe('review');
  });

  it('is incorrect when the slot count does not match the expected character count', () => {
    const status = computeSlotStatus([slot(), slot()], [['力']], { 力: 2 });

    expect(status).toBe('incorrect');
  });

  // A word with multiple valid spellings accepts a drawing of any of them at that position
  it('is correct when the drawing matches an alternate accepted character, not just the primary one', () => {
    const status = computeSlotStatus(
      [slot({ predictions: [{ label: '辭', confidence: 0.9 }], strokesCount: 17 })],
      [['辞', '辭']],
      {
        辞: 13,
        辭: 17,
      },
    );

    expect(status).toBe('correct');
  });

  it('is incorrect when the stroke count matches none of the accepted characters', () => {
    const status = computeSlotStatus([slot({ strokesCount: 1 })], [['辞', '辭']], { 辞: 13, 辭: 17 });

    expect(status).toBe('incorrect');
  });
});

describe('getExpectedCharacterOptions', () => {
  const word = (spellings: string[]): Partial<WordType> => ({ word: spellings });

  it('accepts only the primary spelling when there is just one', () => {
    expect(getExpectedCharacterOptions(word(['辞書']))).toEqual([['辞'], ['書']]);
  });

  it('adds an equal-length alternate spelling as an extra option per position', () => {
    expect(getExpectedCharacterOptions(word(['辞書', '辭書']))).toEqual([['辞', '辭'], ['書']]);
  });

  it('ignores an alternate spelling of a different length — it cannot align position by position', () => {
    expect(getExpectedCharacterOptions(word(['本', '書物']))).toEqual([['本']]);
  });

  it('skips a kana position in the primary spelling for every spelling', () => {
    expect(getExpectedCharacterOptions(word(['お寿司', 'お鮨司']))).toEqual([['寿', '鮨'], ['司']]);
  });
});

const item = (overrides: Partial<WordEvaluationItemType> = {}): WordEvaluationItemType => ({
  word: { word_id: 'a' } as WordType,
  slots: [slot()],
  status: 'idle',
  userConfirmation: null,
  ...overrides,
});

describe('computeWordProgressionDeltas', () => {
  it('counts a correct item as correct', () => {
    const deltas = computeWordProgressionDeltas([item({ status: 'correct' })]);

    expect(deltas).toEqual([{ id: 'a', correct: true }]);
  });

  it('counts an incorrect item with an actual attempt as incorrect', () => {
    const deltas = computeWordProgressionDeltas([item({ status: 'incorrect' })]);

    expect(deltas).toEqual([{ id: 'a', correct: false }]);
  });

  // A word with every slot left empty was skipped, not attempted — shouldn't count against progression
  it('ignores an incorrect item whose slots were all left empty', () => {
    const deltas = computeWordProgressionDeltas([item({ status: 'incorrect', slots: [slot({ image: null, strokesCount: 0 })] })]);

    expect(deltas).toEqual([]);
  });

  it('resolves a reviewed item by the user confirmation', () => {
    const deltas = computeWordProgressionDeltas([item({ status: 'review', userConfirmation: true })]);

    expect(deltas).toEqual([{ id: 'a', correct: true }]);
  });

  it('ignores a reviewed item still awaiting confirmation', () => {
    const deltas = computeWordProgressionDeltas([item({ status: 'review', userConfirmation: null })]);

    expect(deltas).toEqual([]);
  });

  it('ignores an idle item', () => {
    const deltas = computeWordProgressionDeltas([item({ status: 'idle' })]);

    expect(deltas).toEqual([]);
  });
});
