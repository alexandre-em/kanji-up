import { getTierKey, PER_KANJI_UNLOCK_COST } from '../constants/unlockCosts';

// The only grade/JLPT values our tier grid (and pricing) actually knows about. A kanji whose
// classification falls outside these — e.g. a KANJIDIC grade like 9 or 10 that never appears in
// the Selection menu — isn't a "free" tier just because it's absent from PER_KANJI_UNLOCK_COST;
// it's unrecognized, and unrecognized must not silently pass as free.
const KNOWN_JLPT_LEVELS = ['5', '4', '3', '2', '1'];
const KNOWN_GRADE_LEVELS = ['1', '2', '3', '4', '5', '6', '8'];

// A kanji can belong to both a JLPT tier and a school grade tier at once, each with its own lock
// status — free via either path means accessible, so a kanji locked in one classification isn't
// necessarily locked overall.
function applicableTierKeys(kanji: Partial<KanjiType>): string[] {
  const tierKeys: string[] = [];
  if (kanji.kanji?.jlpt) tierKeys.push(getTierKey('jlpt', String(kanji.kanji.jlpt)));
  if (kanji.reference?.grade) tierKeys.push(getTierKey('grade', kanji.reference.grade));
  return tierKeys;
}

function isRecognizedTierKey(tierKey: string): boolean {
  const [category, value] = tierKey.split(':');
  return category === 'jlpt' ? KNOWN_JLPT_LEVELS.includes(value) : KNOWN_GRADE_LEVELS.includes(value);
}

// A single classification counts as an accessible path: recognized-and-free, or
// recognized-paid-and-already-unlocked. Unrecognized never counts, regardless of credits state.
function isAccessibleTier(tierKey: string, userState: UserState): boolean {
  if (!isRecognizedTierKey(tierKey)) return false;
  if (PER_KANJI_UNLOCK_COST[tierKey] === undefined) return true;
  return userState.unlockedDifficulties.includes(tierKey);
}

export function isKanjiLocked(kanji: Partial<KanjiType>, userState: UserState): boolean {
  if (userState.subscriptionPlan === 'premium') return false;
  if (kanji.kanji_id && userState.unlockedKanji.includes(kanji.kanji_id)) return false;

  const tierKeys = applicableTierKeys(kanji);
  // No classification at all, or every classification it has is unrecognized/paid-and-not-bought
  // ("custom" kanji, e.g. reached via search or a word's kanji breakdown) — Premium-only when
  // there's no known free or already-unlocked path in
  if (tierKeys.length === 0) return true;

  return !tierKeys.some((tierKey) => isAccessibleTier(tierKey, userState));
}

// Prices a single-kanji unlock when reached from a context that isn't already scoped to one
// specific tier (search results, a word's kanji breakdown) — picks the cheapest paid tier the
// kanji still owes, since that's the tier the player would actually choose to pay for.
export function getCheapestLockedTier(kanji: Partial<KanjiType>, userState: UserState): string | null {
  const lockedPaidTiers = applicableTierKeys(kanji).filter(
    (tierKey) => PER_KANJI_UNLOCK_COST[tierKey] !== undefined && !userState.unlockedDifficulties.includes(tierKey),
  );
  if (lockedPaidTiers.length === 0) return null;

  return lockedPaidTiers.reduce((cheapest, tierKey) =>
    PER_KANJI_UNLOCK_COST[tierKey] < PER_KANJI_UNLOCK_COST[cheapest] ? tierKey : cheapest,
  );
}
