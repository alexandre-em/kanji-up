import { configureStore } from '@reduxjs/toolkit';

import evaluation from './slices/evaluation';
import flashcards from './slices/flashcards';
import kanji from './slices/kanji';
import lists from './slices/lists';
import missions from './slices/missions';
import selectedKanji from './slices/selectedKanji';
import selectedWord from './slices/selectedWord';
import user from './slices/user';
import word from './slices/word';
import wordEvaluation from './slices/wordEvaluation';

const store = configureStore({
  reducer: {
    kanji,
    selectedKanji,
    selectedWord,
    word,
    user,
    evaluation,
    wordEvaluation,
    missions,
    flashcards,
    lists,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // subscribedAt/subscribedUntil are intentionally Date objects (see UserState) — Redux's
        // default check flags that as non-serializable, but it's deliberate, not a mistake to fix
        ignoredPaths: ['user.subscribedAt', 'user.subscribedUntil'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
