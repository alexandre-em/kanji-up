import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { canCreateList, generateListId } from '../../constants/lists';
import { fileNames, fileServiceInstance } from '../../services/file';
import { RootState } from '..';

const initialState: ListsState = {
  lists: {},
  activeListId: null,
  toAdd: {},
  toRemove: {},
  initStatus: 'idle',
  saveStatus: 'idle',
};

export const initialize = createAsyncThunk<{ lists: Record<string, SelectionList>; activeListId: string | null }>(
  'lists/init',
  async () => {
    const content = await fileServiceInstance.read(fileNames.LISTS);

    return content ?? { lists: {}, activeListId: null };
  },
);

// Cap-checked here (not just in the UI) so a stale/bypassed dispatch can never create a list past
// the free-tier limit — canCreateList itself is the single source of truth, unit tested separately
export const createList = createAsyncThunk<Record<string, SelectionList>, string, { rejectValue: 'cap_reached' }>(
  'lists/create',
  async (name, { getState, rejectWithValue }) => {
    const { lists, user } = getState() as RootState;
    const currentCount = Object.keys(lists.lists).length;

    if (!canCreateList(currentCount, user.subscriptionPlan)) return rejectWithValue('cap_reached');

    const id = generateListId();
    const newLists = { ...lists.lists, [id]: { id, name, kanjiIds: [] } };

    await fileServiceInstance.write(fileNames.LISTS, { lists: newLists, activeListId: lists.activeListId });

    return newLists;
  },
);

export const renameList = createAsyncThunk<Record<string, SelectionList>, { id: string; name: string }>(
  'lists/rename',
  async ({ id, name }, { getState }) => {
    const { lists } = getState() as RootState;
    const target = lists.lists[id];
    if (!target) return lists.lists;

    const newLists = { ...lists.lists, [id]: { ...target, name } };

    await fileServiceInstance.write(fileNames.LISTS, { lists: newLists, activeListId: lists.activeListId });

    return newLists;
  },
);

export const deleteList = createAsyncThunk<{ lists: Record<string, SelectionList>; activeListId: string | null }, string>(
  'lists/delete',
  async (id, { getState }) => {
    const { lists } = getState() as RootState;

    const newLists = { ...lists.lists };
    delete newLists[id];

    const activeListId = lists.activeListId === id ? null : lists.activeListId;

    await fileServiceInstance.write(fileNames.LISTS, { lists: newLists, activeListId });

    return { lists: newLists, activeListId };
  },
);

// Commits the staged toAdd/toRemove onto whichever list was active when Save was pressed — mirrors
// selectedKanji's save flow, just scoped to one list's kanjiIds instead of the whole flat pool
export const saveActiveListSelection = createAsyncThunk<Record<string, SelectionList>, undefined>(
  'lists/saveActiveListSelection',
  async (_, { getState }) => {
    const { lists } = getState() as RootState;
    const { activeListId, toAdd, toRemove } = lists;
    if (!activeListId || !lists.lists[activeListId]) return lists.lists;

    const current = lists.lists[activeListId];
    const keptIds = current.kanjiIds.filter((id) => !toRemove[id]);
    const newKanjiIds = Array.from(new Set([...keptIds, ...Object.keys(toAdd)]));

    const newLists = { ...lists.lists, [activeListId]: { ...current, kanjiIds: newKanjiIds } };

    await fileServiceInstance.write(fileNames.LISTS, { lists: newLists, activeListId });

    return newLists;
  },
);

const setActiveList = (state: ListsState, action: PayloadAction<string | null>) => {
  // Switching the active list drops any uncommitted staged edits — they belonged to the
  // previous list's selection screen, not this one
  return { ...state, activeListId: action.payload, toAdd: {}, toRemove: {} };
};

const selectKanjiForActiveList = (state: ListsState, action: PayloadAction<Partial<KanjiType>>) => {
  const kanjiId = action.payload.kanji_id!;
  const activeList = state.activeListId ? state.lists[state.activeListId] : undefined;
  const alreadyInList = !!activeList?.kanjiIds.includes(kanjiId);

  if (alreadyInList && !state.toRemove[kanjiId]) return state;

  const toRemove = { ...state.toRemove };
  delete toRemove[kanjiId];

  return { ...state, toAdd: { ...state.toAdd, [kanjiId]: action.payload }, toRemove };
};

const unSelectKanjiForActiveList = (state: ListsState, action: PayloadAction<Partial<KanjiType>>) => {
  const kanjiId = action.payload.kanji_id!;

  if (state.toAdd[kanjiId]) {
    const toAdd = { ...state.toAdd };
    delete toAdd[kanjiId];
    return { ...state, toAdd };
  }

  return { ...state, toRemove: { ...state.toRemove, [kanjiId]: action.payload } };
};

const cancelActiveListSelection = (state: ListsState) => {
  return { ...state, toAdd: {}, toRemove: {} };
};

export const lists = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setActiveList,
    selectKanjiForActiveList,
    unSelectKanjiForActiveList,
    cancelActiveListSelection,
    resetSaveStatus: (state: ListsState) => {
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

export default lists.reducer;

export const selectLists = (state: RootState) => state.lists.lists;
export const selectActiveListId = (state: RootState) => state.lists.activeListId;
export const selectActiveList = (state: RootState) =>
  state.lists.activeListId ? state.lists.lists[state.lists.activeListId] : undefined;
export const selectListsInitStatus = (state: RootState) => state.lists.initStatus;
export const selectListsSaveStatus = (state: RootState) => state.lists.saveStatus;
export const selectListsCount = (state: RootState) => Object.keys(state.lists.lists).length;
export const selectKanjiToAddToActiveList = (state: RootState) => state.lists.toAdd;
export const selectKanjiToRemoveFromActiveList = (state: RootState) => state.lists.toRemove;

// What the active list's kanji count WOULD be if saved right now — mirrors
// selectedKanji's selectSelectedKanjiCount, scoped to whichever list is active
export const selectActiveListPendingCount = (state: RootState) => {
  const { lists: allLists, activeListId, toAdd, toRemove } = state.lists;
  const activeList = activeListId ? allLists[activeListId] : undefined;
  if (!activeList) return 0;

  const committedCount = activeList.kanjiIds.filter((id) => !toRemove[id]).length;

  return committedCount + Object.keys(toAdd).length;
};
