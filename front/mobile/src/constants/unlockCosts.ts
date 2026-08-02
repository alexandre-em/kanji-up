// Mirrors the server-side cost tables (kanji-up-auth) for display purposes only — the backend
// is the sole source of truth and re-derives/enforces the real cost itself. A stale value here
// would only ever show the wrong price, never let anyone pay less than the server charges.
export const PER_KANJI_UNLOCK_COST: Record<string, number> = {
  'jlpt:3': 2,
  'jlpt:2': 4,
  'jlpt:1': 8,
  'grade:8': 3,
};

export const BULK_UNLOCK_COST: Record<string, number> = {
  'jlpt:3': 20,
  'jlpt:2': 50,
  'jlpt:1': 100,
  'grade:8': 50,
};

export function getTierKey(category: string, difficulty: string): string {
  return `${category}:${difficulty}`;
}
