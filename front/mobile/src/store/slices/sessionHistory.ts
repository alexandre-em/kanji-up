import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { core } from '../../services/http';
import { RootState } from '..';

export const PAGE_SIZE = 20;

type SessionHistoryState = {
  itemsByType: Record<SessionKind, SessionType[]>;
  hasMoreByType: Record<SessionKind, boolean>;
  pageByType: Record<SessionKind, number>;
  status: RequestStatusType;
};

const initialState: SessionHistoryState = {
  itemsByType: { kanji: [], word: [], other: [] },
  hasMoreByType: { kanji: true, word: true, other: true },
  pageByType: { kanji: 1, word: 1, other: 1 },
  status: 'idle',
};

// Appends to whichever page is next for that type — the caller doesn't track pagination itself,
// it just keeps calling this until hasMoreByType[type] is false
export const fetchSessionHistory = createAsyncThunk<
  { type: SessionKind; results: SessionType[]; page: number },
  { userId: string; type: SessionKind }
>('sessionHistory/fetch', async ({ userId, type }, { getState }) => {
  const state = (getState() as RootState).sessionHistory;
  const page = state.pageByType[type];
  const response = await core.sessionsService!.findByUser(userId, type, page, PAGE_SIZE);

  return { type, results: response.data, page };
});

export const sessionHistory = createSlice({
  name: 'sessionHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSessionHistory.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(fetchSessionHistory.fulfilled, (state, action) => {
      const { type, results, page } = action.payload;
      state.itemsByType[type] = page === 1 ? results : [...state.itemsByType[type], ...results];
      state.hasMoreByType[type] = results.length === PAGE_SIZE;
      state.pageByType[type] = page + 1;
      state.status = 'succeeded';
    });
    builder.addCase(fetchSessionHistory.rejected, (state) => {
      state.status = 'failed';
    });
  },
});

export default sessionHistory.reducer;

export const selectSessionHistoryItems = (state: RootState) => state.sessionHistory.itemsByType;
export const selectSessionHistoryHasMore = (state: RootState) => state.sessionHistory.hasMoreByType;
export const selectSessionHistoryStatus = (state: RootState) => state.sessionHistory.status;
