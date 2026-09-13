import { MIN_LIST_SIZE_FOR_GAME } from './lists';

// Shared by kanji and word accuracy tracking — each has its own progression map (keyed by
// kanji_id / word_id respectively) but the same tuning and math.
export const PROGRESSION_MASTERY_THRESHOLD_PERCENT = 90;
// Below this many attempts, an accuracy percentage is statistically meaningless (e.g. 1/1 reads
// as "100% mastered") — both the displayed percent and mastery gate on it.
export const PROGRESSION_MIN_ATTEMPTS = 20;

export type ProgressionEntry = { correct: number; total: number; lastSeenAtCount?: number };

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

// Kanji only, for now. How many other questions must pass before this kanji is eligible again —
// grows with both accuracy and volume, so a kanji seen 200 times at 95% waits longer than one
// seen 20 times at 95%, and a bad answer collapses the wait back down immediately.
export function getKanjiReviewDelay(value: ProgressionEntry | number | undefined): number {
  const entry = normalizeProgressionEntry(value);
  if (entry.total === 0) return 0;

  const accuracy = entry.correct / entry.total;
  return Math.round(entry.total * accuracy ** 2);
}

export function isKanjiDue(value: ProgressionEntry | number | undefined, currentQuestionCount: number): boolean {
  const entry = normalizeProgressionEntry(value);
  if (entry.lastSeenAtCount === undefined) return true;

  return currentQuestionCount - entry.lastSeenAtCount >= getKanjiReviewDelay(entry);
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Builds a session's worth of kanji, favoring ones due for review and never repeating one on two
// consecutive questions. Reshuffled laps (rather than one big weighted draw) are what keeps the
// repeat pattern from becoming predictable session over session.
export function selectSessionKanji(
  pool: KanjiType[],
  progression: Record<string, ProgressionEntry | number>,
  count: number,
  currentQuestionCount: number,
): KanjiType[] {
  if (pool.length === 0) return [];

  const due = pool.filter((kanji) => isKanjiDue(progression[kanji.kanji_id], currentQuestionCount));
  // Too few due kanji would turn the session into near-repeats of the same handful — falling back
  // to the whole pool keeps enough variety to fill it
  const candidates = due.length >= MIN_LIST_SIZE_FOR_GAME ? due : pool;

  const result: KanjiType[] = [];
  while (result.length < count) {
    const lap = shuffle(candidates);

    if (result.length > 0 && lap.length > 1 && lap[0].kanji_id === result[result.length - 1].kanji_id) {
      [lap[0], lap[1]] = [lap[1], lap[0]];
    }

    result.push(...lap);
  }

  return result.slice(0, count);
}
