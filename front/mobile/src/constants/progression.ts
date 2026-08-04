// Mirrors the web app's kanji progression tuning (front/apps/kanji-up/constants/index.ts)
export const KANJI_PROGRESSION_MAX = 20;
export const KANJI_PROGRESSION_INC = 2;
export const KANJI_PROGRESSION_INC_LOW = 1;

export function clampProgression(current: number, inc: number): number {
  return Math.min(Math.max(current + inc, 0), KANJI_PROGRESSION_MAX);
}

// Used by the "kanjiMastery" daily mission: did this batch of deltas push any kanji to full
// mastery for the first time? Simulates the same clamped sequence updateProgression will apply,
// against a pre-dispatch snapshot, rather than re-reading state after the fact
export function hasNewlyMasteredKanji(deltas: { id: string; inc: number }[], progression: Record<string, number>): boolean {
  const touchedIds = Array.from(new Set(deltas.map((delta) => delta.id)));
  const wasMastered = new Set(touchedIds.filter((id) => (progression[id] ?? 0) >= KANJI_PROGRESSION_MAX));

  const afterValues: Record<string, number> = {};
  deltas.forEach((delta) => {
    const current = afterValues[delta.id] ?? progression[delta.id] ?? 0;
    afterValues[delta.id] = clampProgression(current, delta.inc);
  });

  return touchedIds.some((id) => !wasMastered.has(id) && (afterValues[id] ?? 0) >= KANJI_PROGRESSION_MAX);
}
