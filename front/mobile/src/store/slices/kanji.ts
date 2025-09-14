import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { core } from '../../services/http';
import { RootState } from '../';

interface KanjiState {
  entities: { [uuid: string]: KanjiType };
  kanjis: KanjiType[];
  last: {
    page: number;
    type: 'grade' | 'jlpt';
    difficulty: string;
    totalPage: number;
  } | null;
  search: { [search: string]: SearchResult<KanjiType> };
  random: KanjiType[] | undefined;
  getOneStatus: RequestStatusType;
  getAllStatus: RequestStatusType;
  getRandomStatus: RequestStatusType;
  searchStatus: RequestStatusType;
}

type GetAllInput = {
  difficulty: string;
  page?: number;
  type: 'grade' | 'jlpt';
};

interface SearchKanjiInput {
  query: string;
  page?: number;
  limit?: number;
}

const initialState: KanjiState = {
  entities: {},
  kanjis: [],
  random: undefined,
  search: {},
  last: null,
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

export const getAll = createAsyncThunk<
  (Pagination<KanjiType> & { difficulty: string; type: 'grade' | 'jlpt' }) | null,
  GetAllInput
>('kanjis/getAll', async ({ page = 1, ...params }, { getState }) => {
  const { kanji } = getState() as RootState;
  if (params.type === kanji.last?.type && params.difficulty === kanji.last?.difficulty && page <= kanji.last.page) {
    console.log('same difficulty and page <= last.page', page, kanji.last?.page);
    return null;
  }

  const response = await core.kanjiService!.getAll({ page, [params.type]: params.difficulty, limit: 50 });

  console.log({ response });

  if (params.difficulty !== kanji.last?.difficulty) {
    console.log('different difficulty', params.difficulty, kanji.last?.difficulty);
    return { ...response.data, difficulty: params.difficulty, type: params.type };
  }

  console.log('same difficulty but page > last.page', page, kanji.last?.page);

  return { ...response.data, docs: kanji.kanjis.concat(response.data.docs), difficulty: params.difficulty, type: params.type };
});

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
  },
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
      if (action.payload === null) return;
      state.kanjis = action.payload.docs;
      state.last = {
        page: action.payload.page,
        difficulty: action.payload.difficulty,
        type: action.payload.type,
        totalPage: action.payload.totalPages,
      };
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

export const selectLastGet = (state: RootState) => state.kanji.last;
export const selectGetOne = (state: RootState) => state.kanji.entities;
export const selectGetOneStatus = (state: RootState) => state.kanji.getOneStatus;
export const selectGetAllResult = (state: RootState) => state.kanji.kanjis;
export const selectGetAllStatus = (state: RootState) => state.kanji.getAllStatus;
export const selectGetRandomResult = (state: RootState) => state.kanji.random;
export const selectGetRandomStatus = (state: RootState) => state.kanji.getRandomStatus;
export const selectSearchResult = (state: RootState) => state.kanji.search;
export const selectSearchStatus = (state: RootState) => state.kanji.searchStatus;
export default kanjiSlice.reducer;
