import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { WordType } from 'kanji-app-types';

const initialState: WordType[] = [];

const initialize = (state: WordType[], action: PayloadAction<WordType[]>) => {
  return action.payload;
};

const addWord = (state: WordType[], action: PayloadAction<WordType>) => {
  const isAdded = !!state.find((word) => word.word_id === action.payload.word_id);
  if (isAdded) return state;

  return [...state, action.payload];
};

const removeWord = (state: WordType[], action: PayloadAction<WordType>) => {
  const isPresent = !!state.find((word) => word.word_id === action.payload.word_id);
  if (!isPresent) return state;

  return state.filter((word) => word.word_id !== action.payload.word_id);
};

const reset = () => {
  return [];
};

export const word = createSlice({
  name: 'word',
  initialState,
  reducers: {
    initialize,
    addWord,
    removeWord,
    reset,
  },
});

export default word.reducer;
