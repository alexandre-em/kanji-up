import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { canCreateWordList, generateListId } from '../../constants/lists';
import { fileNames, fileServiceInstance } from '../../services/file';
import { RootState } from '..';

const initialState: WordListsState = {
  lists: {},
  activeListId: null,
  toAdd: {},
  toRemove: {},
  initStatus: 'idle',
  saveStatus: 'idle',
};

export const initialize = createAsyncThunk<{ lists: Record<string, WordSelectionList>; activeListId: string | null }>(
  'wordLists/init',
  async () => {
    const content = await fileServiceInstance.read(fileNames.WORD_LISTS);

    return content ?? { lists: {}, activeListId: null };
  },
);

// Cap-checked here (not just in the UI) so a stale/bypassed dispatch can never create a list past
// the free-tier limit — canCreateWordList itself is the single source of truth, unit tested separately
export const createList = createAsyncThunk<Record<string, WordSelectionList>, string, { rejectValue: 'cap_reached' }>(
  'wordLists/create',
  async (name, { getState, rejectWithValue }) => {
    const { wordLists, user } = getState() as RootState;
    const currentCount = Object.keys(wordLists.lists).length;

    if (!canCreateWordList(currentCount, user.subscriptionPlan)) return rejectWithValue('cap_reached');

    const id = generateListId();
    const newLists = { ...wordLists.lists, [id]: { id, name, wordIds: [] } };

    await fileServiceInstance.write(fileNames.WORD_LISTS, { lists: newLists, activeListId: wordLists.activeListId });

    return newLists;
  },
);

export const renameList = createAsyncThunk<Record<string, WordSelectionList>, { id: string; name: string }>(
  'wordLists/rename',
  async ({ id, name }, { getState }) => {
    const { wordLists } = getState() as RootState;
    const target = wordLists.lists[id];
    if (!target) return wordLists.lists;

    const newLists = { ...wordLists.lists, [id]: { ...target, name } };

    await fileServiceInstance.write(fileNames.WORD_LISTS, { lists: newLists, activeListId: wordLists.activeListId });

    return newLists;
  },
);

export const deleteList = createAsyncThunk<{ lists: Record<string, WordSelectionList>; activeListId: string | null }, string>(
  'wordLists/delete',
  async (id, { getState }) => {
    const { wordLists } = getState() as RootState;

    const newLists = { ...wordLists.lists };
    delete newLists[id];

    const activeListId = wordLists.activeListId === id ? null : wordLists.activeListId;

    await fileServiceInstance.write(fileNames.WORD_LISTS, { lists: newLists, activeListId });

    return { lists: newLists, activeListId };
  },
);

// Commits the staged toAdd/toRemove onto whichever list was active when Save was pressed — mirrors
// lists.ts's save flow, just scoped to a list's wordIds instead of kanjiIds
export const saveActiveListSelection = createAsyncThunk<Record<string, WordSelectionList>, undefined>(
  'wordLists/saveActiveListSelection',
  async (_, { getState }) => {
    const { wordLists } = getState() as RootState;
    const { activeListId, toAdd, toRemove } = wordLists;
    if (!activeListId || !wordLists.lists[activeListId]) return wordLists.lists;

    const current = wordLists.lists[activeListId];
    const keptIds = current.wordIds.filter((id) => !toRemove[id]);
    const newWordIds = Array.from(new Set([...keptIds, ...Object.keys(toAdd)]));

    const newLists = { ...wordLists.lists, [activeListId]: { ...current, wordIds: newWordIds } };

    await fileServiceInstance.write(fileNames.WORD_LISTS, { lists: newLists, activeListId });

    return newLists;
  },
);

const setActiveList = (state: WordListsState, action: PayloadAction<string | null>) => {
  // Switching the active list drops any uncommitted staged edits — they belonged to the
  // previous list's selection screen, not this one
  return { ...state, activeListId: action.payload, toAdd: {}, toRemove: {} };
};

const selectWordForActiveList = (state: WordListsState, action: PayloadAction<Partial<WordType>>) => {
  const wordId = action.payload.word_id!;
  const activeList = state.activeListId ? state.lists[state.activeListId] : undefined;
  const alreadyInList = !!activeList?.wordIds.includes(wordId);

  if (alreadyInList && !state.toRemove[wordId]) return state;

  const toRemove = { ...state.toRemove };
  delete toRemove[wordId];

  return { ...state, toAdd: { ...state.toAdd, [wordId]: action.payload }, toRemove };
};

const unSelectWordForActiveList = (state: WordListsState, action: PayloadAction<Partial<WordType>>) => {
  const wordId = action.payload.word_id!;

  if (state.toAdd[wordId]) {
    const toAdd = { ...state.toAdd };
    delete toAdd[wordId];
    return { ...state, toAdd };
  }

  return { ...state, toRemove: { ...state.toRemove, [wordId]: action.payload } };
};

const cancelActiveListSelection = (state: WordListsState) => {
  return { ...state, toAdd: {}, toRemove: {} };
};

export const wordLists = createSlice({
  name: 'wordLists',
  initialState,
  reducers: {
    setActiveList,
    selectWordForActiveList,
    unSelectWordForActiveList,
    cancelActiveListSelection,
    resetSaveStatus: (state: WordListsState) => {
      state.saveStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.initStatus = 'pending';
    });
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.lists = action.payload.lists;
      state.activeListId = action.payload.activeListId;
      state.initStatus = 'succeeded';
    });
    builder.addCase(initialize.rejected, (state) => {
      state.initStatus = 'failed';
    });
    builder.addCase(createList.fulfilled, (state, action) => {
      state.lists = action.payload;
    });
    builder.addCase(renameList.fulfilled, (state, action) => {
      state.lists = action.payload;
    });
    builder.addCase(deleteList.fulfilled, (state, action) => {
      state.lists = action.payload.lists;
      state.activeListId = action.payload.activeListId;
    });
    builder.addCase(saveActiveListSelection.pending, (state) => {
      state.saveStatus = 'pending';
    });
    builder.addCase(saveActiveListSelection.fulfilled, (state, action) => {
      state.lists = action.payload;
      state.toAdd = {};
      state.toRemove = {};
      state.saveStatus = 'succeeded';
    });
    builder.addCase(saveActiveListSelection.rejected, (state) => {
      state.saveStatus = 'failed';
    });
  },
});

export default wordLists.reducer;

export const selectWordLists = (state: RootState) => state.wordLists.lists;
export const selectActiveWordListId = (state: RootState) => state.wordLists.activeListId;
export const selectActiveWordList = (state: RootState) =>
  state.wordLists.activeListId ? state.wordLists.lists[state.wordLists.activeListId] : undefined;
export const selectWordListsInitStatus = (state: RootState) => state.wordLists.initStatus;
export const selectWordListsSaveStatus = (state: RootState) => state.wordLists.saveStatus;
export const selectWordListsCount = (state: RootState) => Object.keys(state.wordLists.lists).length;
export const selectWordsToAddToActiveList = (state: RootState) => state.wordLists.toAdd;
export const selectWordsToRemoveFromActiveList = (state: RootState) => state.wordLists.toRemove;

// What the active list's word count WOULD be if saved right now — mirrors
// lists.ts's selectActiveListPendingCount, scoped to words
export const selectActiveWordListPendingCount = (state: RootState) => {
  const { lists: allLists, activeListId, toAdd, toRemove } = state.wordLists;
  const activeList = activeListId ? allLists[activeListId] : undefined;
  if (!activeList) return 0;

  const committedCount = activeList.wordIds.filter((id) => !toRemove[id]).length;

  return committedCount + Object.keys(toAdd).length;
};
