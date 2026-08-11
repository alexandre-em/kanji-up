// Shared by kanji and word accuracy tracking — each has its own progression map (keyed by
// kanji_id / word_id respectively) but the same tuning and math.
export const PROGRESSION_MASTERY_THRESHOLD_PERCENT = 90;
// Below this many attempts, an accuracy percentage is statistically meaningless (e.g. 1/1 reads
// as "100% mastered") — both the displayed percent and mastery gate on it.
export const PROGRESSION_MIN_ATTEMPTS = 20;

export type ProgressionEntry = { correct: number; total: number };

// Existing accounts have kanji entries stored as a plain number (the old momentum score,
// pre-accuracy model) — treated as "never attempted" rather than crashing on .correct/.total
// access, since that old score isn't a valid accuracy proxy. Self-heals to the new shape next
// time the user answers that kanji again. Word entries are new and never have this legacy shape.
export function normalizeProgressionEntry(value: ProgressionEntry | number | undefined): ProgressionEntry {
  if (!value || typeof value === 'number') return { correct: 0, total: 0 };
  return value;
}

export function getAccuracyPercent(value: ProgressionEntry | number | undefined): number | null {
  const entry = normalizeProgressionEntry(value);
  if (entry.total < PROGRESSION_MIN_ATTEMPTS) return null;
  return Math.round((entry.correct / entry.total) * 100);
}

function isMastered(value: ProgressionEntry | number | undefined): boolean {
  const percent = getAccuracyPercent(value);
  return percent !== null && percent > PROGRESSION_MASTERY_THRESHOLD_PERCENT;
}

export const isKanjiMastered = isMastered;
export const isWordMastered = isMastered;

// Did this batch of deltas push any entry to mastery for the first time? Simulates the same
// sequence the reducer will apply, against a pre-dispatch snapshot, rather than re-reading state
// after the fact. Shared core for both the "kanjiMastery" mission (kanji progression) and its
// word equivalent.
function hasNewlyMastered(
  deltas: { id: string; correct: boolean }[],
  progression: Record<string, ProgressionEntry | number>,
): boolean {
  const touchedIds = Array.from(new Set(deltas.map((delta) => delta.id)));
  const wasMastered = new Set(touchedIds.filter((id) => isMastered(progression[id])));

  const afterValues: Record<string, ProgressionEntry> = {};
  deltas.forEach((delta) => {
    const current = afterValues[delta.id] ?? normalizeProgressionEntry(progression[delta.id]);
    afterValues[delta.id] = { correct: current.correct + (delta.correct ? 1 : 0), total: current.total + 1 };
  });

  return touchedIds.some((id) => !wasMastered.has(id) && isMastered(afterValues[id]));
}

export const hasNewlyMasteredKanji = hasNewlyMastered;
export const hasNewlyMasteredWord = hasNewlyMastered;
