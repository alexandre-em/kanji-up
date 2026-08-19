import listsReducer, { lists } from './lists';

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
