export type LocalSlot = {
  id: number;
  image: string | null;
  strokesCount: number;
};

export type FilledSlot = LocalSlot & { image: string };

// Folds a just-captured drawing into `slots`, replacing whichever one `targetId` points to.
// Zero strokes (the user switched away without drawing anything new) leaves an already-filled
// slot's existing drawing untouched, but discards a fresh slot that was never actually drawn on —
// otherwise it would sit forever as a dead, invisible entry (excluded from every filled-slots
// view, yet still occupying an id no thumbnail ever shows).
export function resolveSlotOnLeave(
  slots: LocalSlot[],
  targetId: number | null,
  capture: { image: string | null; strokesCount: number },
): LocalSlot[] {
  if (targetId === null) return slots;

  const target = slots.find((slot) => slot.id === targetId);
  if (!target) return slots;

  if (capture.strokesCount > 0) {
    return slots.map((slot) =>
      slot.id === targetId ? { ...slot, image: capture.image, strokesCount: capture.strokesCount } : slot,
    );
  }

  return target.image === null ? slots.filter((slot) => slot.id !== targetId) : slots;
}
