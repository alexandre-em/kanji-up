import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fileNames, readFile, writeFile } from '../../services/file';

const initialState: SelectedKanjiState = {
  selectedKanji: {},
  toAdd: {},
  toRemove: {},
  initStatus: 'idle',
};

export const initialize = createAsyncThunk<{ [key: string]: Partial<KanjiType> }>('kanjiSelection/init', async () => {
  const content = await readFile(fileNames.SELECTED_KANJI);

  return JSON.parse(content) as { [key: string]: Partial<KanjiType> };
});

const selectKanji = (state: SelectedKanjiState, action: PayloadAction<KanjiType>) => {
  if (state.selectedKanji[action.payload.kanji_id] && !state.toRemove[action.payload.kanji_id]) {
    return state;
  }

  const toRemove: { [id: string]: Partial<KanjiType> } = {};
  Object.keys(state.toRemove).forEach((kId) => {
    if (kId !== action.payload.kanji_id) {
      toRemove[kId] = state.toRemove[kId];
    }
  });

  return { ...state, toAdd: { ...state.toAdd, [action.payload.kanji_id]: action.payload }, toRemove };
};

const unSelectKanji = (state: SelectedKanjiState, action: PayloadAction<KanjiType>) => {
  if (state.toAdd[action.payload.kanji_id]) {
    delete state.toAdd[action.payload.kanji_id];
    return;
  }

  return { ...state, toRemove: { ...state.toRemove, [action.payload.kanji_id]: action.payload } };
};

export const save = (state: SelectedKanjiState) => {
  const newSelectedKanji = Object.keys(state.selectedKanji)
    .concat(Object.keys(state.toAdd))
    .filter((id) => !state.toRemove[id])
    .reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: state.selectedKanji[curr] ?? state.toAdd[curr],
      }),
      {}
    );

  writeFile(fileNames.SELECTED_KANJI, JSON.stringify(newSelectedKanji));

  return { ...state, toRemove: {}, toAdd: {}, selectedKanji: newSelectedKanji };
};

const cancel = (state: SelectedKanjiState) => {
  return { ...state, toAdd: {}, toRemove: {} };
};

const reset = (state: SelectedKanjiState) => {
  return { ...state, selectedKanji: {}, toAdd: {}, toRemove: {} };
};

export const selectedKanji = createSlice({
  name: 'kanjiSelection',
  initialState,
  reducers: {
    cancel,
    selectKanji,
    unSelectKanji,
    save,
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
  },
});

export default selectedKanji.reducer;
