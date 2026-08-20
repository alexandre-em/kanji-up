import { RootState } from '..';
import wordListsReducer, { selectActiveWordListPendingCount, wordLists } from './wordLists';

const word1: Partial<WordType> = { word_id: 'w1' };
const word2: Partial<WordType> = { word_id: 'w2' };

const baseState: WordListsState = {
  lists: {
    listA: { id: 'listA', name: 'List A', wordIds: ['w1'] },
    listB: { id: 'listB', name: 'List B', wordIds: [] },
  },
  activeListId: 'listA',
  toAdd: {},
  toRemove: {},
  initStatus: 'succeeded',
  saveStatus: 'idle',
};

describe('setActiveList', () => {
  it('switches the active list', () => {
    const result = wordListsReducer(baseState, wordLists.actions.setActiveList('listB'));

    expect(result.activeListId).toBe('listB');
  });

  it('clears any staged edits from the previous list', () => {
    const stateWithStaging: WordListsState = { ...baseState, toAdd: { w2: word2 }, toRemove: { w1: word1 } };

    const result = wordListsReducer(stateWithStaging, wordLists.actions.setActiveList('listB'));

    expect(result.toAdd).toEqual({});
    expect(result.toRemove).toEqual({});
  });

  it('accepts null to deselect the active list', () => {
    const result = wordListsReducer(baseState, wordLists.actions.setActiveList(null));

    expect(result.activeListId).toBeNull();
  });
});

describe('selectWordForActiveList', () => {
  it('stages a word not yet in the active list as an addition', () => {
    const result = wordListsReducer(baseState, wordLists.actions.selectWordForActiveList(word2));

    expect(result.toAdd).toEqual({ w2: word2 });
  });

  it('is a no-op for a word already in the active list and not pending removal', () => {
    const result = wordListsReducer(baseState, wordLists.actions.selectWordForActiveList(word1));

    expect(result).toBe(baseState);
  });

  it('un-stages a pending removal instead of re-adding, for a word already in the list', () => {
    const stateWithPendingRemoval: WordListsState = { ...baseState, toRemove: { w1: word1 } };

    const result = wordListsReducer(stateWithPendingRemoval, wordLists.actions.selectWordForActiveList(word1));

    expect(result.toRemove).toEqual({});
    expect(result.toAdd).toEqual({ w1: word1 });
  });
});

describe('unSelectWordForActiveList', () => {
  it('stages an in-list word as a removal', () => {
    const result = wordListsReducer(baseState, wordLists.actions.unSelectWordForActiveList(word1));

    expect(result.toRemove).toEqual({ w1: word1 });
  });

  it('un-stages a pending addition instead of flagging it for removal, for a word not yet saved', () => {
    const stateWithPendingAddition: WordListsState = { ...baseState, toAdd: { w2: word2 } };

    const result = wordListsReducer(stateWithPendingAddition, wordLists.actions.unSelectWordForActiveList(word2));

    expect(result.toAdd).toEqual({});
    expect(result.toRemove).toEqual({});
  });
});

describe('cancelActiveListSelection', () => {
  it('discards both staged additions and removals', () => {
    const stateWithStaging: WordListsState = { ...baseState, toAdd: { w2: word2 }, toRemove: { w1: word1 } };

    const result = wordListsReducer(stateWithStaging, wordLists.actions.cancelActiveListSelection());

    expect(result.toAdd).toEqual({});
    expect(result.toRemove).toEqual({});
  });
});

describe('selectActiveWordListPendingCount', () => {
  const asRootState = (wordListsState: WordListsState) => ({ wordLists: wordListsState }) as RootState;

  it('is 0 when there is no active list', () => {
    const state: WordListsState = { ...baseState, activeListId: null };

    expect(selectActiveWordListPendingCount(asRootState(state))).toBe(0);
  });

  it("counts the active list's committed words when nothing is staged", () => {
    expect(selectActiveWordListPendingCount(asRootState(baseState))).toBe(1);
  });

  it('adds staged additions', () => {
    const state: WordListsState = { ...baseState, toAdd: { w2: word2 } };

    expect(selectActiveWordListPendingCount(asRootState(state))).toBe(2);
  });

  it('subtracts staged removals', () => {
    const state: WordListsState = { ...baseState, toRemove: { w1: word1 } };

    expect(selectActiveWordListPendingCount(asRootState(state))).toBe(0);
  });

  it('nets additions and removals together', () => {
    const state: WordListsState = { ...baseState, toAdd: { w2: word2 }, toRemove: { w1: word1 } };

    expect(selectActiveWordListPendingCount(asRootState(state))).toBe(1);
  });
});
