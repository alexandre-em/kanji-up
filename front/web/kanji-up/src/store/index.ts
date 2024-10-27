import { configureStore } from '@reduxjs/toolkit';

import kanji from './reducers/kanji';
import selectedKanji from './reducers/selectedKanji';
import selectedWord from './reducers/selectedWord';
import user from './reducers/user';
import userScore from './reducers/userScore';
import word from './reducers/word';

const store = configureStore({
  reducer: {
    kanji,
    word,
    user,
    userScore,
    selectedKanji,
    selectedWord,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
