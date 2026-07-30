import { configureStore } from '@reduxjs/toolkit';

import evaluation from './slices/evaluation';
import kanji from './slices/kanji';
import progression from './slices/progression';
import selectedKanji from './slices/selectedKanji';
import selectedWord from './slices/selectedWord';
import user from './slices/user';
import word from './slices/word';

const store = configureStore({
  reducer: {
    kanji,
    progression,
    selectedKanji,
    selectedWord,
    word,
    user,
    evaluation,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
