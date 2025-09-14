import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fileNames, fileServiceInstance } from '../../services/file';
import { RootState } from '..';

const initialState: SelectedKanjiState = {
  selectedKanji: {},
  toAdd: {},
  toRemove: {},
  initStatus: 'idle',
  saveStatus: 'idle',
};

export const initialize = createAsyncThunk<{ [key: string]: Partial<KanjiType> }>('kanjiSelection/init', async () => {
  const content = await fileServiceInstance.read(fileNames.SELECTED_KANJI);

  return JSON.parse(content) as { [key: string]: Partial<KanjiType> };
});

const selectKanji = (state: SelectedKanjiState, action: PayloadAction<Partial<KanjiType>>) => {
  if (state.selectedKanji[action.payload.kanji_id!] && !state.toRemove[action.payload.kanji_id!]) {
    return state;
  }

  const toRemove: { [id: string]: Partial<KanjiType> } = {};
  Object.keys(state.toRemove).forEach((kId) => {
    if (kId !== action.payload.kanji_id) {
      toRemove[kId] = state.toRemove[kId];
    }
  });

  return { ...state, toAdd: { ...state.toAdd, [action.payload.kanji_id!]: action.payload }, toRemove };
};

const unSelectKanji = (state: SelectedKanjiState, action: PayloadAction<Partial<KanjiType>>) => {
  if (state.toAdd[action.payload.kanji_id!]) {
    delete state.toAdd[action.payload.kanji_id!];
    return;
  }

  return { ...state, toRemove: { ...state.toRemove, [action.payload.kanji_id!]: action.payload } };
};

export const save = createAsyncThunk<typeof initialState.selectedKanji, undefined>('kanjis/getById', async (_, { getState }) => {
  const { selectedKanji } = getState() as RootState;
  const selectedKanjiNewState = { ...selectedKanji.selectedKanji };

  const addedKanjiList = Object.keys(selectedKanjiNewState).concat(Object.keys(selectedKanji.toAdd));
  const filteredKanji = addedKanjiList.filter((id) => !selectedKanji.toRemove[id]);
  const newSelectedKanjiState = filteredKanji.reduce(
    (prev, curr) => ({
      ...prev,
      [curr]: selectedKanjiNewState[curr] ?? selectedKanji.toAdd[curr],
    }),
    {},
  );

  await fileServiceInstance.write(fileNames.SELECTED_KANJI, JSON.stringify(newSelectedKanjiState));

  return newSelectedKanjiState;
});

const cancel = (state: SelectedKanjiState) => {
  return { ...state, toAdd: {}, toRemove: {} };
};

const reset = () => {
  return initialState;
};

export const selectedKanji = createSlice({
  name: 'kanjiSelection',
  initialState,
  reducers: {
    cancel,
    selectKanji,
    unSelectKanji,
    reset,
  },
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.initStatus = 'pending';
    });
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.selectedKanji = action.payload;
      state.initStatus = 'succeeded';
    });
    builder.addCase(initialize.rejected, (state) => {
      state.initStatus = 'failed';
      state.toAdd = {};
      state.toRemove = {};
    });
    builder.addCase(save.pending, (state) => {
      state.saveStatus = 'pending';
    });
    builder.addCase(save.fulfilled, (state, action) => {
      state.selectedKanji = action.payload;
      state.toAdd = {};
      state.toRemove = {};
      state.saveStatus = 'succeeded';
    });
    builder.addCase(save.rejected, (state) => {
      state.saveStatus = 'failed';
    });
  },
});

export default selectedKanji.reducer;

export const selectSelectedKanji = (state: RootState) => state.selectedKanji.selectedKanji;
export const selectKanjiToAdd = (state: RootState) => state.selectedKanji.toAdd;
export const selectKanjiToDelete = (state: RootState) => state.selectedKanji.toRemove;
export const selectSelectedKanjiInitStatus = (state: RootState) => state.selectedKanji.initStatus;
