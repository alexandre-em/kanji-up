import { applyReview, createInitialCardProgress, isCardDue, SRS_INTERVAL_LADDER_DAYS } from './flashcards';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('createInitialCardProgress', () => {
  it('starts at the first ladder step, due immediately', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');

    expect(createInitialCardProgress(now)).toEqual({ intervalIndex: 0, dueAt: now.toISOString() });
  });
});

describe('applyReview', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('advances to the next ladder step when the card was known', () => {
    const progress = { intervalIndex: 0, dueAt: now.toISOString() };

    const result = applyReview(progress, true, now);

    expect(result.intervalIndex).toBe(1);
    expect(result.dueAt).toBe(new Date(now.getTime() + SRS_INTERVAL_LADDER_DAYS[1] * DAY_MS).toISOString());
  });

  it('caps at the last ladder step once already there', () => {
    const lastIndex = SRS_INTERVAL_LADDER_DAYS.length - 1;
    const progress = { intervalIndex: lastIndex, dueAt: now.toISOString() };

    const result = applyReview(progress, true, now);

    expect(result.intervalIndex).toBe(lastIndex);
    expect(result.dueAt).toBe(new Date(now.getTime() + SRS_INTERVAL_LADDER_DAYS[lastIndex] * DAY_MS).toISOString());
  });

  it('resets to the first ladder step when the card was not known, regardless of prior progress', () => {
    const progress = { intervalIndex: 3, dueAt: now.toISOString() };

    const result = applyReview(progress, false, now);

    expect(result.intervalIndex).toBe(0);
    expect(result.dueAt).toBe(now.toISOString());
  });

  it('resetting an already-first-step card is a no-op on the index', () => {
    const progress = { intervalIndex: 0, dueAt: now.toISOString() };

    const result = applyReview(progress, false, now);

    expect(result.intervalIndex).toBe(0);
  });

  it('reaches the last ladder step by honest progression, not just capping', () => {
    const lastIndex = SRS_INTERVAL_LADDER_DAYS.length - 1;
    const progress = { intervalIndex: lastIndex - 1, dueAt: now.toISOString() };

    const result = applyReview(progress, true, now);

    expect(result.intervalIndex).toBe(lastIndex);
    expect(result.dueAt).toBe(new Date(now.getTime() + SRS_INTERVAL_LADDER_DAYS[lastIndex] * DAY_MS).toISOString());
  });
});

describe('SRS_INTERVAL_LADDER_DAYS', () => {
  it('starts due-now and strictly increases after that — a regression here silently changes the review pacing', () => {
    expect(SRS_INTERVAL_LADDER_DAYS[0]).toBe(0);
    for (let i = 1; i < SRS_INTERVAL_LADDER_DAYS.length; i += 1) {
      expect(SRS_INTERVAL_LADDER_DAYS[i]).toBeGreaterThan(SRS_INTERVAL_LADDER_DAYS[i - 1]);
    }
  });
});

describe('isCardDue', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('is due when there is no progress yet', () => {
    expect(isCardDue(undefined, now)).toBe(true);
  });

  it('is due when dueAt is in the past', () => {
    const progress = { intervalIndex: 1, dueAt: new Date(now.getTime() - DAY_MS).toISOString() };

    expect(isCardDue(progress, now)).toBe(true);
  });

  it('is due when dueAt is exactly now', () => {
    const progress = { intervalIndex: 1, dueAt: now.toISOString() };

    expect(isCardDue(progress, now)).toBe(true);
  });

  it('is not due when dueAt is in the future', () => {
    const progress = { intervalIndex: 1, dueAt: new Date(now.getTime() + DAY_MS).toISOString() };

    expect(isCardDue(progress, now)).toBe(false);
  });
});
