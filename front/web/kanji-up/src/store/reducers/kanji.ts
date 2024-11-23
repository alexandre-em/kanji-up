import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../';
import { core } from '../../shared';

interface KanjiState {
  entities: { [uuid: string]: KanjiType };
  kanjis: Pagination<KanjiType> | undefined;
  search: { [search: string]: SearchResult<KanjiType> };
  random: KanjiType[] | undefined;
  getOneStatus: RequestStatusType;
  getAllStatus: RequestStatusType;
  getRandomStatus: RequestStatusType;
  searchStatus: RequestStatusType;
}

interface GetAllInput {
  grade: string;
  page?: number;
  limit?: number;
}

interface SearchKanjiInput {
  query: string;
  page?: number;
  limit?: number;
}

const initialState: KanjiState = {
  entities: {},
  kanjis: undefined,
  random: undefined,
  search: {},
  getOneStatus: 'idle',
  getAllStatus: 'idle',
  getRandomStatus: 'idle',
  searchStatus: 'idle',
};

export const getOne = createAsyncThunk<KanjiType, string>('kanjis/getById', async (id, { getState }) => {
  const { kanji } = getState() as RootState;
  if (kanji.entities[id]?.kanji_id) return kanji.entities[id];
  const response = await core.kanjiService!.getOne({ id });
  return response.data;
});

export const getAll = createAsyncThunk<Pagination<KanjiType>, GetAllInput>(
  'kanjis/getAll',
  async ({ limit = 0, page = 0, grade }) => {
    const response = await core.kanjiService!.getAll({ limit, page, grade });
    return response.data;
  }
);

export const getRandom = createAsyncThunk<KanjiType[], number>('kanjis/getRandom', async (number) => {
  const response = await core.kanjiService!.getRandom(number);
  return response.data;
});

export const search = createAsyncThunk<SearchResult<KanjiType> & { query: string }, SearchKanjiInput>(
  'kanjis/search',
  async ({ query, page = 0, limit = 10 }, { getState }) => {
    const { kanji } = getState() as RootState;
    if (kanji.search[query] && kanji.search[query].current > page) return { ...kanji.search[query], query };
    const response = await core.kanjiService!.search({ query, page, limit });
    return {
      results: [...(kanji.search[query]?.results || []), ...response.data.docs],
      query,
      current: response.data.page,
      totalPages: response.data.totalPages,
      totalDocs: response.data.totalDocs,
    };
  }
);

const kanjiSlice = createSlice({
  name: 'kanji',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOne.pending, (state) => {
      state.getOneStatus = 'pending';
    });
    builder.addCase(getOne.fulfilled, (state, action) => {
      state.entities[action.payload.kanji_id] = action.payload;
      state.getOneStatus = 'succeeded';
    });
    builder.addCase(getOne.rejected, (state) => {
      state.getOneStatus = 'failed';
    });
    builder.addCase(getAll.pending, (state) => {
      state.getAllStatus = 'pending';
    });
    builder.addCase(getAll.fulfilled, (state, action) => {
      state.kanjis = action.payload;
      state.getAllStatus = 'succeeded';
    });
    builder.addCase(getAll.rejected, (state) => {
      state.getAllStatus = 'failed';
    });
    builder.addCase(getRandom.pending, (state) => {
      state.getRandomStatus = 'pending';
    });
    builder.addCase(getRandom.fulfilled, (state, action) => {
      state.random = action.payload;
      state.getRandomStatus = 'succeeded';
    });
    builder.addCase(getRandom.rejected, (state) => {
      state.getRandomStatus = 'failed';
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

export const selectGetOne = (state: RootState) => state.kanji.entities;
export const selectGetOneStatus = (state: RootState) => state.kanji.getOneStatus;
export const selectGetAllResult = (state: RootState) => state.kanji.kanjis;
export const selectGetAllStatus = (state: RootState) => state.kanji.getAllStatus;
export const selectGetRandomResult = (state: RootState) => state.kanji.random;
export const selectGetRandomStatus = (state: RootState) => state.kanji.getRandomStatus;
export const selectSearchResult = (state: RootState) => state.kanji.search;
export const selectSearchStatus = (state: RootState) => state.kanji.searchStatus;
export default kanjiSlice.reducer;
