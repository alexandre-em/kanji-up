import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import error from './slices/error';
import evaluation from './slices/evaluation';
import kanji from './slices/selectedKanji';
import settings from './slices/settings';
import user from './slices/user';

const devTools = false;

const store = configureStore({
  reducer: {
    error,
    kanji,
    evaluation,
    settings,
    user,
  },
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware();
    if (devTools) {
      defaultMiddleware.push(logger);
    }
    return defaultMiddleware;
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
