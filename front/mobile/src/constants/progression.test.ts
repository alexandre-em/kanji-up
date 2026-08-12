import {
  getAccuracyPercent,
  hasNewlyMasteredKanji,
  hasNewlyMasteredWord,
  isKanjiMastered,
  isWordMastered,
  normalizeProgressionEntry,
  PROGRESSION_MASTERY_THRESHOLD_PERCENT,
  PROGRESSION_MIN_ATTEMPTS,
} from './progression';

describe('normalizeProgressionEntry', () => {
  it('treats undefined as never attempted', () => {
    expect(normalizeProgressionEntry(undefined)).toEqual({ correct: 0, total: 0 });
  });

  it('treats a legacy plain-number score as never attempted', () => {
    expect(normalizeProgressionEntry(42)).toEqual({ correct: 0, total: 0 });
  });

  it('passes a real progression entry through untouched', () => {
    const entry = { correct: 5, total: 10 };

    expect(normalizeProgressionEntry(entry)).toBe(entry);
  });
});

describe('getAccuracyPercent', () => {
  it('is null below the minimum attempts threshold', () => {
    expect(getAccuracyPercent({ correct: 10, total: PROGRESSION_MIN_ATTEMPTS - 1 })).toBeNull();
  });

  it('computes a percentage exactly at the minimum attempts threshold', () => {
    expect(getAccuracyPercent({ correct: 10, total: PROGRESSION_MIN_ATTEMPTS })).toBe(50);
  });

  it('is null for an undefined entry (never attempted)', () => {
    expect(getAccuracyPercent(undefined)).toBeNull();
  });

  it('is null for a legacy plain-number entry', () => {
    expect(getAccuracyPercent(99)).toBeNull();
  });

  it('rounds to the nearest whole percent', () => {
    expect(getAccuracyPercent({ correct: 15, total: 23 })).toBe(65);
  });

  it('is 0% for a perfect miss streak', () => {
    expect(getAccuracyPercent({ correct: 0, total: PROGRESSION_MIN_ATTEMPTS })).toBe(0);
  });

  it('is 100% for a perfect streak', () => {
    expect(getAccuracyPercent({ correct: PROGRESSION_MIN_ATTEMPTS, total: PROGRESSION_MIN_ATTEMPTS })).toBe(100);
  });
});

describe.each([
  ['isKanjiMastered', isKanjiMastered],
  ['isWordMastered', isWordMastered],
])('%s', (_name, isMastered) => {
  it('is false below the minimum attempts threshold, however high the accuracy', () => {
    expect(isMastered({ correct: 5, total: 5 })).toBe(false);
  });

  it('is false exactly at the mastery threshold (strictly greater-than, not equal)', () => {
    expect(isMastered({ correct: 18, total: 20 })).toBe(false); // 90%
  });

  it('is true just above the mastery threshold', () => {
    expect(isMastered({ correct: 46, total: 50 })).toBe(true); // 92%
  });

  it('is false for an entry that has never been attempted', () => {
    expect(isMastered(undefined)).toBe(false);
  });
});

describe.each([
  ['hasNewlyMasteredKanji', hasNewlyMasteredKanji],
  ['hasNewlyMasteredWord', hasNewlyMasteredWord],
])('%s', (_name, hasNewlyMastered) => {
  it('is false for an empty batch of deltas', () => {
    expect(hasNewlyMastered([], {})).toBe(false);
  });

  it('is true when a fresh entry crosses into mastery within the batch', () => {
    // 50 correct answers in a row, starting from nothing tracked yet
    const deltas = Array.from({ length: 50 }, () => ({ id: 'k1', correct: true }));

    expect(hasNewlyMastered(deltas, {})).toBe(true);
  });

  it('is false when the entry was already mastered before the batch', () => {
    const progression = { k1: { correct: 46, total: 50 } }; // already 92%
    const deltas = [{ id: 'k1', correct: true }];

    expect(hasNewlyMastered(deltas, progression)).toBe(false);
  });

  it('is false when the batch does not push the entry past the minimum attempts threshold', () => {
    const deltas = [
      { id: 'k1', correct: true },
      { id: 'k1', correct: true },
    ];

    expect(hasNewlyMastered(deltas, {})).toBe(false);
  });

  it('resets a legacy plain-number entry to zero attempts before accumulating the batch', () => {
    const progression = { k1: 999 }; // old momentum score, not a real accuracy entry
    const deltas = Array.from({ length: 50 }, () => ({ id: 'k1', correct: true }));

    expect(hasNewlyMastered(deltas, progression)).toBe(true);
  });

  it('is true if any one id in a multi-id batch newly crosses into mastery', () => {
    const progression = { alreadyMastered: { correct: 46, total: 50 } };
    const deltas = [
      { id: 'alreadyMastered', correct: true },
      ...Array.from({ length: 50 }, () => ({ id: 'freshlyMastered', correct: true })),
    ];

    expect(hasNewlyMastered(deltas, progression)).toBe(true);
  });

  it('accumulates multiple deltas for the same id within one batch, not just the last one', () => {
    // Starts at 18/20 (90%, not mastered). One more correct answer alone wouldn't reach the
    // batch's cumulative effect unless deltas actually stack: 19/21 is still not mastered, so
    // this only passes if every delta in the batch is applied, not just the final one.
    const progression = { k1: { correct: 18, total: 20 } };
    const deltas = [
      { id: 'k1', correct: true },
      { id: 'k1', correct: true },
      { id: 'k1', correct: true },
    ];

    // 21/23 ≈ 91.3% — newly crosses the 90% threshold only with all three deltas applied
    expect(hasNewlyMastered(deltas, progression)).toBe(true);
  });

  it('is false when the batch answers are wrong and accuracy drops further from mastery', () => {
    const progression = { k1: { correct: 15, total: 20 } };
    const deltas = [{ id: 'k1', correct: false }];

    expect(hasNewlyMastered(deltas, progression)).toBe(false);
  });
});

it('exposes the tuning constants used across kanji and word progression', () => {
  expect(PROGRESSION_MASTERY_THRESHOLD_PERCENT).toBe(90);
  expect(PROGRESSION_MIN_ATTEMPTS).toBe(20);
});
