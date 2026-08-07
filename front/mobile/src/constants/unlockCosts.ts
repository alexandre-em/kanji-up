// Mirrors the server-side cost tables (kanji-up-auth) for display purposes only — the backend
// is the sole source of truth and re-derives/enforces the real cost itself. A stale value here
// would only ever show the wrong price, never let anyone pay less than the server charges.
//
// jlpt:3/jlpt:2 are free now (not in these tables). jlpt:1 and grade:8 are the only paid tiers:
// per-kanji is priced to be individually reachable by a motivated free user, while the bulk
// price (~20% off buying every single kanji in the tier individually) is deliberately steep —
// it's meant to push toward Premium rather than be a realistic credits target.
export const PER_KANJI_UNLOCK_COST: Record<string, number> = {
  'jlpt:1': 5,
  'grade:8': 5,
};

export const BULK_UNLOCK_COST: Record<string, number> = {
  'jlpt:1': 4928,
  'grade:8': 4520,
};

export function getTierKey(category: string, difficulty: string): string {
  return `${category}:${difficulty}`;
}
