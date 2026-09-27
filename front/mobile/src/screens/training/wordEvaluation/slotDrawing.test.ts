import { LocalSlot, resolveSlotOnLeave } from './slotDrawing';

const slot = (overrides: Partial<LocalSlot> = {}): LocalSlot => ({
  id: 1,
  image: null,
  strokesCount: 0,
  ...overrides,
});

describe('resolveSlotOnLeave', () => {
  it('does nothing when there is no active target', () => {
    const slots = [slot()];

    expect(resolveSlotOnLeave(slots, null, { image: 'x', strokesCount: 3 })).toBe(slots);
  });

  it('does nothing when the target no longer exists', () => {
    const slots = [slot({ id: 1 })];

    expect(resolveSlotOnLeave(slots, 99, { image: 'x', strokesCount: 3 })).toBe(slots);
  });

  it('saves the capture into a fresh, not-yet-drawn slot', () => {
    const slots = [slot({ id: 1, image: null, strokesCount: 0 })];

    const result = resolveSlotOnLeave(slots, 1, { image: 'new-image', strokesCount: 5 });

    expect(result).toEqual([{ id: 1, image: 'new-image', strokesCount: 5 }]);
  });

  it('overwrites an already-filled slot when redrawn with new strokes', () => {
    const slots = [slot({ id: 1, image: 'old-image', strokesCount: 4 })];

    const result = resolveSlotOnLeave(slots, 1, { image: 'new-image', strokesCount: 2 });

    expect(result).toEqual([{ id: 1, image: 'new-image', strokesCount: 2 }]);
  });

  // Switching away without drawing anything new must not silently wipe what was already saved
  it('leaves an already-filled slot untouched when nothing new was drawn', () => {
    const slots = [slot({ id: 1, image: 'old-image', strokesCount: 4 })];

    const result = resolveSlotOnLeave(slots, 1, { image: null, strokesCount: 0 });

    expect(result).toEqual(slots);
  });

  // A fresh slot that was activated but never drawn on must not linger as a dead entry — it
  // never got a chance to become part of the answer, and it has no thumbnail to show for it
  it('discards a fresh slot that was never drawn on', () => {
    const slots = [slot({ id: 1, image: null, strokesCount: 0 }), slot({ id: 2, image: 'other', strokesCount: 3 })];

    const result = resolveSlotOnLeave(slots, 1, { image: null, strokesCount: 0 });

    expect(result).toEqual([{ id: 2, image: 'other', strokesCount: 3 }]);
  });

  it('only touches the targeted slot, leaving every other slot untouched', () => {
    const slots = [slot({ id: 1, image: 'a', strokesCount: 1 }), slot({ id: 2, image: 'b', strokesCount: 2 })];

    const result = resolveSlotOnLeave(slots, 2, { image: 'new-b', strokesCount: 7 });

    expect(result).toEqual([
      { id: 1, image: 'a', strokesCount: 1 },
      { id: 2, image: 'new-b', strokesCount: 7 },
    ]);
  });
});
