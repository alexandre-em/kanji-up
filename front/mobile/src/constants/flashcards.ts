// Leitner-style ladder in days: a card that's known moves to the next interval, one that isn't
// resets to the start. Kept to a fixed ladder (rather than a full SM-2 ease-factor scheme) since
// the review is a simple "knew it / didn't" call, not a 4-point confidence grade.
export const SRS_INTERVAL_LADDER_DAYS = [0, 1, 3, 7, 14, 30];

export type FlashcardCardProgress = {
  intervalIndex: number;
  dueAt: string;
};

// A card the player has never reviewed yet — due immediately (intervalIndex 0 is due-now)
export function createInitialCardProgress(now: Date = new Date()): FlashcardCardProgress {
  return { intervalIndex: 0, dueAt: now.toISOString() };
}

export function applyReview(progress: FlashcardCardProgress, knew: boolean, now: Date = new Date()): FlashcardCardProgress {
  const intervalIndex = knew ? Math.min(progress.intervalIndex + 1, SRS_INTERVAL_LADDER_DAYS.length - 1) : 0;
  const days = SRS_INTERVAL_LADDER_DAYS[intervalIndex];
  const dueAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return { intervalIndex, dueAt: dueAt.toISOString() };
}

export function isCardDue(progress: FlashcardCardProgress | undefined, now: Date = new Date()): boolean {
  if (!progress) return true;
  return new Date(progress.dueAt).getTime() <= now.getTime();
}
