import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../';
import { core } from '../../shared';

interface WordState {
  entities: { [uuid: string]: WordType };
  words: Pagination<WordType> | undefined;
  search: { [search: string]: SearchResult<WordType> };
  getOneStatus: RequestStatusType;
  getAllStatus: RequestStatusType;
  searchStatus: RequestStatusType;
}

interface GetAllInput {
  page?: number;
  limit?: number;
}

interface SearchWordInput {
  query: string;
  page?: number;
  limit?: number;
}

const initialState: WordState = {
  entities: {},
  words: undefined,
  search: {},
  getOneStatus: 'idle',
  getAllStatus: 'idle',
  searchStatus: 'idle',
};

export const getOne = createAsyncThunk<WordType, string>('words/getById', async (id, { getState }) => {
  const { word } = getState() as RootState;
  if (word.entities[id].word_id) return word.entities[id];
  const response = await core.wordService!.getOne({ id });
  return response.data;
});

export const getAll = createAsyncThunk<Pagination<WordType>, GetAllInput>('words/getAll', async ({ limit = 0, page = 1 }) => {
  const response = await core.wordService!.getAll({ limit, page });
  return response.data;
});

export const search = createAsyncThunk<SearchResult<WordType> & { query: string }, SearchWordInput>(
  'words/search',
  async ({ query, page = 1, limit = 10 }, { getState }) => {
    const { word } = getState() as RootState;
    if (word.search[query]) return { ...word.search[query], query };
    const response = await core.wordService!.search({ query, page, limit });
    return {
      results: [...(word.search[query]?.results || []), ...response.data.docs],
      query,
      current: response.data.page,
      totalPages: response.data.totalPages,
      totalDocs: response.data.totalDocs,
    };
  }
);

const wordSlice = createSlice({
  name: 'word',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOne.pending, (state) => {
      state.getOneStatus = 'pending';
    });
    builder.addCase(getOne.fulfilled, (state, action) => {
      state.entities[action.payload.word_id] = action.payload;
      state.getOneStatus = 'succeeded';
    });
    builder.addCase(getOne.rejected, (state) => {
      state.getOneStatus = 'failed';
    });
    builder.addCase(getAll.pending, (state) => {
      state.getAllStatus = 'pending';
    });
    builder.addCase(getAll.fulfilled, (state, action) => {
      state.words = action.payload;
      state.getAllStatus = 'succeeded';
    });
    builder.addCase(getAll.rejected, (state) => {
      state.getAllStatus = 'failed';
    });
    builder.addCase(search.pending, (state) => {
      state.searchStatus = 'pending';
    });
    builder.addCase(search.fulfilled, (state, action) => {
      state.search[action.payload.query] = action.payload;
      state.searchStatus = 'succeeded';
    });
    builder.addCase(search.rejected, (state) => {
      state.searchStatus = 'failed';
    });
  },
});

export const selectGetOne = (state: RootState) => state.word.entities;
export const selectGetOneStatus = (state: RootState) => state.word.getOneStatus;
export const selectGetAllResult = (state: RootState) => state.word.words;
export const selectGetAllStatus = (state: RootState) => state.word.getAllStatus;
export const selectSearchResult = (state: RootState) => state.word.search;
export const selectSearchStatus = (state: RootState) => state.word.searchStatus;
export default wordSlice.reducer;
