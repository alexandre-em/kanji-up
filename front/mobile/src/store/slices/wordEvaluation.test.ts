import { computeSlotStatus, sampleWords, WordSlotType } from './wordEvaluation';

const word = (id: string): WordType => ({ word_id: id, word: [id], reading: [], definition: [] }) as unknown as WordType;

describe('sampleWords', () => {
  it('returns the input untouched when already at or under the cap', () => {
    const words = [word('a'), word('b')];

    expect(sampleWords(words, 5)).toBe(words);
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
    const status = computeSlotStatus([slot()], ['力'], { 力: 2 });

    expect(status).toBe('correct');
  });

  it('is incorrect when a slot was left empty', () => {
    const status = computeSlotStatus([slot({ image: null, strokesCount: 0 })], ['力'], { 力: 2 });

    expect(status).toBe('incorrect');
  });

  it('is incorrect on a wrong stroke count when the expected count is known', () => {
    const status = computeSlotStatus([slot({ strokesCount: 5 })], ['力'], { 力: 2 });

    expect(status).toBe('incorrect');
  });

  // The bug this whole function was extracted to fix: a character whose stroke count couldn't be
  // resolved (not in strokesByCharacter) must not be treated as wrong — it's unknown, not invalid
  it('does not fail the stroke check for a character with no known expected count', () => {
    const status = computeSlotStatus([slot({ strokesCount: 999 })], ['力'], {});

    expect(status).toBe('correct');
  });

  it('is review when the drawing does not match the expected character, everything else fine', () => {
    const status = computeSlotStatus([slot({ predictions: [{ label: '人', confidence: 0.9 }] })], ['力'], { 力: 2 });

    expect(status).toBe('review');
  });

  it('is incorrect when the slot count does not match the expected character count', () => {
    const status = computeSlotStatus([slot(), slot()], ['力'], { 力: 2 });

    expect(status).toBe('incorrect');
  });
});
