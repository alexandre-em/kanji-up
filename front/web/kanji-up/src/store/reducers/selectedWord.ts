import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../';
import { fileNames, readFile, writeFile } from '../../shared/services/file';

type SaveThunkReturnType = Omit<SelectedWordState, 'initStatus' | 'saveStatus'>;

const initialState: SelectedWordState = {
  selectedWord: {},
  toAdd: {},
  toRemove: {},
  initStatus: 'idle',
  saveStatus: 'idle',
};

export const initialize = createAsyncThunk<{ [key: string]: Partial<WordType> }>('wordSelection/init', async () => {
  const content = await readFile(fileNames.SELECTED_WORD);

  return JSON.parse(content) as { [key: string]: Partial<WordType> };
});

const selectWord = (state: SelectedWordState, action: PayloadAction<WordType>) => {
  if (state.selectedWord[action.payload.word_id] && !state.toRemove[action.payload.word_id]) {
    return state;
  }

  const toRemove: { [id: string]: Partial<WordType> } = {};
  Object.keys(state.toRemove).forEach((kId) => {
    if (kId !== action.payload.word_id) {
      toRemove[kId] = state.toRemove[kId];
    }
  });

  return { ...state, toAdd: { ...state.toAdd, [action.payload.word_id]: action.payload }, toRemove };
};

const unSelectWord = (state: SelectedWordState, action: PayloadAction<WordType>) => {
  if (state.toAdd[action.payload.word_id]) {
    delete state.toAdd[action.payload.word_id];
    return;
  }

  return { ...state, toRemove: { ...state.toRemove, [action.payload.word_id]: action.payload } };
};

export const save = createAsyncThunk<SaveThunkReturnType>('wordSelection/save', async (_, { getState }) => {
  const { selectedWord } = getState() as RootState;

  const state: Omit<SelectedWordState, 'initStatus' | 'saveStatus'> = { ...selectedWord };

  Object.keys(state.toRemove).forEach((id) => {
    delete state.selectedWord[id];
    delete state.toRemove[id];
  });
  Object.keys(state.toAdd).forEach((id) => {
    state.selectedWord[id] = state.toAdd[id];
    delete state.toAdd[id];
  });

  await writeFile(fileNames.SELECTED_WORD, JSON.stringify(state.selectedWord));

  return state;
});

const cancel = (state: SelectedWordState) => {
  return { ...state, toAdd: {}, toRemove: {} };
};

const reset = (state: SelectedWordState) => {
  return { ...state, selectedWord: {}, toAdd: {}, toRemove: {} };
};

export const selectedWord = createSlice({
  name: 'wordSelection',
  initialState,
  reducers: {
    cancel,
    selectWord,
    unSelectWord,
    reset,
  },
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.initStatus = 'pending';
    });
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.selectedWord = action.payload;
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

export default selectedWord.reducer;
