import { configureStore } from '@reduxjs/toolkit';

import kanji from './slices/kanji';
import selectedKanji from './slices/selectedKanji';
import selectedWord from './slices/selectedWord';
import user from './slices/user';
import word from './slices/word';

const store = configureStore({
  reducer: {
    kanji,
    selectedKanji,
    selectedWord,
    word,
    user,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
