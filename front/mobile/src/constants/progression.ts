export const KANJI_MASTERY_THRESHOLD_PERCENT = 90;
// Below this many attempts, an accuracy percentage is statistically meaningless (e.g. 1/1 reads
// as "100% mastered") — both the displayed percent and mastery gate on it.
export const KANJI_PROGRESSION_MIN_ATTEMPTS = 20;

export type KanjiProgressionEntry = { correct: number; total: number };

// Existing accounts have this stored as a plain number (the old momentum score, pre-accuracy
// model) — treated as "never attempted" rather than crashing on .correct/.total access, since
// that old score isn't a valid accuracy proxy. Self-heals to the new shape next time the user
// answers that kanji again.
export function normalizeProgressionEntry(value: KanjiProgressionEntry | number | undefined): KanjiProgressionEntry {
  if (!value || typeof value === 'number') return { correct: 0, total: 0 };
  return value;
}

export function getAccuracyPercent(value: KanjiProgressionEntry | number | undefined): number | null {
  const entry = normalizeProgressionEntry(value);
  if (entry.total < KANJI_PROGRESSION_MIN_ATTEMPTS) return null;
  return Math.round((entry.correct / entry.total) * 100);
}

export function isKanjiMastered(value: KanjiProgressionEntry | number | undefined): boolean {
  const percent = getAccuracyPercent(value);
  return percent !== null && percent > KANJI_MASTERY_THRESHOLD_PERCENT;
}

// Used by the "kanjiMastery" daily mission: did this batch of deltas push any kanji to mastery
// for the first time? Simulates the same sequence updateProgression will apply, against a
// pre-dispatch snapshot, rather than re-reading state after the fact
export function hasNewlyMasteredKanji(
  deltas: { id: string; correct: boolean }[],
  progression: Record<string, KanjiProgressionEntry | number>,
): boolean {
  const touchedIds = Array.from(new Set(deltas.map((delta) => delta.id)));
  const wasMastered = new Set(touchedIds.filter((id) => isKanjiMastered(progression[id])));

  const afterValues: Record<string, KanjiProgressionEntry> = {};
  deltas.forEach((delta) => {
    const current = afterValues[delta.id] ?? normalizeProgressionEntry(progression[delta.id]);
    afterValues[delta.id] = { correct: current.correct + (delta.correct ? 1 : 0), total: current.total + 1 };
  });

  return touchedIds.some((id) => !wasMastered.has(id) && isKanjiMastered(afterValues[id]));
}
