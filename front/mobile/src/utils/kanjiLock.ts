import { getTierKey, PER_KANJI_UNLOCK_COST } from '../constants/unlockCosts';

// A kanji can belong to both a JLPT tier and a school grade tier at once, each with its own lock
// status — free via either path means accessible, so a kanji locked in one classification isn't
// necessarily locked overall. Only lock it when every classification it has is a paid,
// not-yet-unlocked tier.
function applicableTierKeys(kanji: Partial<KanjiType>): string[] {
  const tierKeys: string[] = [];
  if (kanji.kanji?.jlpt) tierKeys.push(getTierKey('jlpt', String(kanji.kanji.jlpt)));
  if (kanji.reference?.grade) tierKeys.push(getTierKey('grade', kanji.reference.grade));
  return tierKeys;
}

export function isKanjiLocked(kanji: Partial<KanjiType>, userState: UserState): boolean {
  if (userState.subscriptionPlan === 'premium') return false;
  if (kanji.kanji_id && userState.unlockedKanji.includes(kanji.kanji_id)) return false;

  const tierKeys = applicableTierKeys(kanji);
  // No classification at all is treated as accessible — nothing to buy, nothing to gate
  if (tierKeys.length === 0) return false;

  return tierKeys.every(
    (tierKey) => PER_KANJI_UNLOCK_COST[tierKey] !== undefined && !userState.unlockedDifficulties.includes(tierKey),
  );
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
