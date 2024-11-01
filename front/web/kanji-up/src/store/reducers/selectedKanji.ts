import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../';
import { fileNames, readFile, writeFile } from '../../services/file';

type SaveThunkReturnType = Omit<SelectedKanjiState, 'initStatus' | 'saveStatus'>;

const initialState: SelectedKanjiState = {
  selectedKanji: {},
  toAdd: {},
  toRemove: {},
  initStatus: 'idle',
  saveStatus: 'idle',
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

export const save = createAsyncThunk<SaveThunkReturnType>('kanjiSelection/save', async (_, { getState }) => {
  const { selectedKanji } = getState() as RootState;

  const state: Omit<SelectedKanjiState, 'initStatus' | 'saveStatus'> = { ...selectedKanji };

  Object.keys(state.toRemove).forEach((id) => {
    delete state.selectedKanji[id];
    delete state.toRemove[id];
  });
  Object.keys(state.toAdd).forEach((id) => {
    state.selectedKanji[id] = state.toAdd[id];
    delete state.toAdd[id];
  });

  await writeFile(fileNames.SELECTED_KANJI, JSON.stringify(state.selectedKanji));

  return state;
});

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
    });
    builder.addCase(save.pending, (state) => {
      state.initStatus = 'pending';
    });
    builder.addCase(save.fulfilled, (state, action) => {
      state = { ...action.payload, saveStatus: 'succeeded', initStatus: state.initStatus };
    });
    builder.addCase(save.rejected, (state) => {
      state.saveStatus = 'failed';
    });
  },
});

export default selectedKanji.reducer;
