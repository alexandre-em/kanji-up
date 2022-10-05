import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import error from './slices/error';
import kanji from './slices/selectedKanji';

const devTools = false;

const store = configureStore({
  reducer: {
    error,
    kanji,
  },
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware();
    if (devTools) { defaultMiddleware.push(logger); }
    return defaultMiddleware;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

