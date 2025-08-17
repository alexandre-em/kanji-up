import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fileNames, fileServiceInstance } from '../../services/file';
import { RootState } from '../';

const initialState: SelectedWordState = {
  selectedWord: {},
  toAdd: {},
  toRemove: {},
  initStatus: 'idle',
  saveStatus: 'idle',
};

export const initialize = createAsyncThunk<{ [key: string]: Partial<WordType> }>('wordSelection/init', async () => {
  const content = await fileServiceInstance.read(fileNames.SELECTED_WORD);

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

export const save = createAsyncThunk<typeof initialState.selectedWord, undefined>('kanjis/getById', async (_, { getState }) => {
  const { selectedWord } = getState() as RootState;
  const selectedWordNewState = { ...selectedWord.selectedWord };

  const newSelectedWord = Object.keys(selectedWordNewState.selectedKanji)
    .concat(Object.keys(selectedWord.toAdd))
    .filter((id) => !selectedWord.toRemove[id])
    .reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: selectedWordNewState[curr] ?? selectedWord.toAdd[curr],
      }),
      {},
    );

  await fileServiceInstance.write(fileNames.SELECTED_WORD, JSON.stringify(newSelectedWord));

  return newSelectedWord;
});

const cancel = (state: SelectedWordState) => {
  return { ...state, toAdd: {}, toRemove: {} };
};

const reset = (state: SelectedWordState) => {
  return initialState;
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
      state.saveStatus = 'pending';
    });
    builder.addCase(save.fulfilled, (state, action) => {
      state.selectedWord = action.payload;
      state.toAdd = {};
      state.toRemove = {};
      state.saveStatus = 'succeeded';
    });
    builder.addCase(save.rejected, (state) => {
      state.saveStatus = 'failed';
    });
  },
});

export default selectedWord.reducer;
