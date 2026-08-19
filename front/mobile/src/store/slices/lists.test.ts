import { RootState } from '..';
import listsReducer, { lists, selectActiveListPendingCount } from './lists';

const kanji1: Partial<KanjiType> = { kanji_id: 'k1' };
const kanji2: Partial<KanjiType> = { kanji_id: 'k2' };

const baseState: ListsState = {
  lists: {
    listA: { id: 'listA', name: 'List A', kanjiIds: ['k1'] },
    listB: { id: 'listB', name: 'List B', kanjiIds: [] },
  },
  activeListId: 'listA',
  toAdd: {},
  toRemove: {},
  initStatus: 'succeeded',
  saveStatus: 'idle',
};

describe('setActiveList', () => {
  it('switches the active list', () => {
    const result = listsReducer(baseState, lists.actions.setActiveList('listB'));

    expect(result.activeListId).toBe('listB');
  });

  it('clears any staged edits from the previous list', () => {
    const stateWithStaging: ListsState = { ...baseState, toAdd: { k2: kanji2 }, toRemove: { k1: kanji1 } };

    const result = listsReducer(stateWithStaging, lists.actions.setActiveList('listB'));

    expect(result.toAdd).toEqual({});
    expect(result.toRemove).toEqual({});
  });

  it('accepts null to deselect the active list', () => {
    const result = listsReducer(baseState, lists.actions.setActiveList(null));

    expect(result.activeListId).toBeNull();
  });
});

describe('selectKanjiForActiveList', () => {
  it('stages a kanji not yet in the active list as an addition', () => {
    const result = listsReducer(baseState, lists.actions.selectKanjiForActiveList(kanji2));

    expect(result.toAdd).toEqual({ k2: kanji2 });
  });

  it('is a no-op for a kanji already in the active list and not pending removal', () => {
    const result = listsReducer(baseState, lists.actions.selectKanjiForActiveList(kanji1));

    expect(result).toBe(baseState);
  });

  it('un-stages a pending removal instead of re-adding, for a kanji already in the list', () => {
    const stateWithPendingRemoval: ListsState = { ...baseState, toRemove: { k1: kanji1 } };

    const result = listsReducer(stateWithPendingRemoval, lists.actions.selectKanjiForActiveList(kanji1));

    expect(result.toRemove).toEqual({});
    expect(result.toAdd).toEqual({ k1: kanji1 });
  });
});

describe('unSelectKanjiForActiveList', () => {
  it('stages an in-list kanji as a removal', () => {
    const result = listsReducer(baseState, lists.actions.unSelectKanjiForActiveList(kanji1));

    expect(result.toRemove).toEqual({ k1: kanji1 });
  });

  it('un-stages a pending addition instead of flagging it for removal, for a kanji not yet saved', () => {
    const stateWithPendingAddition: ListsState = { ...baseState, toAdd: { k2: kanji2 } };

    const result = listsReducer(stateWithPendingAddition, lists.actions.unSelectKanjiForActiveList(kanji2));

    expect(result.toAdd).toEqual({});
    expect(result.toRemove).toEqual({});
  });
});

describe('cancelActiveListSelection', () => {
  it('discards both staged additions and removals', () => {
    const stateWithStaging: ListsState = { ...baseState, toAdd: { k2: kanji2 }, toRemove: { k1: kanji1 } };

    const result = listsReducer(stateWithStaging, lists.actions.cancelActiveListSelection());

    expect(result.toAdd).toEqual({});
    expect(result.toRemove).toEqual({});
  });
});

describe('selectActiveListPendingCount', () => {
  const asRootState = (listsState: ListsState) => ({ lists: listsState }) as RootState;

  it('is 0 when there is no active list', () => {
    const state: ListsState = { ...baseState, activeListId: null };

    expect(selectActiveListPendingCount(asRootState(state))).toBe(0);
  });

  it("counts the active list's committed kanji when nothing is staged", () => {
    expect(selectActiveListPendingCount(asRootState(baseState))).toBe(1);
  });

  it('adds staged additions', () => {
    const state: ListsState = { ...baseState, toAdd: { k2: kanji2 } };

    expect(selectActiveListPendingCount(asRootState(state))).toBe(2);
  });

  it('subtracts staged removals', () => {
    const state: ListsState = { ...baseState, toRemove: { k1: kanji1 } };

    expect(selectActiveListPendingCount(asRootState(state))).toBe(0);
  });

  it('nets additions and removals together', () => {
    const state: ListsState = { ...baseState, toAdd: { k2: kanji2 }, toRemove: { k1: kanji1 } };

    expect(selectActiveListPendingCount(asRootState(state))).toBe(1);
  });
});
