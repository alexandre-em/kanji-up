import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../';
import { core } from '../../shared';

interface UserState {
  entities: { [uuid: string]: User };
  search: { [search: string]: UserSearchResult };
  getOneStatus: RequestStatusType;
  searchStatus: RequestStatusType;
  getFollowersStatus: RequestStatusType;
  getFollowingStatus: RequestStatusType;
}

interface SearchUserInput {
  query: string;
}

const initialState: UserState = {
  entities: {},
  search: {},
  getOneStatus: 'idle',
  searchStatus: 'idle',
  getFollowersStatus: 'idle',
  getFollowingStatus: 'idle',
};

export const getOne = createAsyncThunk<User, string>('users/getById', async (id, { getState }) => {
  const { user } = getState() as RootState;
  if (user.entities[id]?.user_id) return user.entities[id];
  const response = await core.userService!.getOne(id);
  return response.data;
});

export const search = createAsyncThunk<{ [key: string]: UserSearchResult }, SearchUserInput>(
  'users/search',
  async ({ query }, { getState }) => {
    const { user } = getState() as RootState;
    if (user.search[query]) return { [query]: user.search[query] };
    const response = await core.userService!.search(query);
    return { [query]: response.data };
  }
);

export const getFollowers = createAsyncThunk<{ id: string; result: UserFollow }, string>(
  'users/getFollowers',
  async (id, { getState }) => {
    const { user } = getState() as RootState;
    if (user.entities[id]?.followers) return { id, result: user.entities[id].followers! };
    const response = await core.userService!.getFollowers(id);
    return { id, result: response.data };
  }
);

export const getFollowing = createAsyncThunk<{ id: string; result: UserFollow }, string>(
  'users/getFollowing',
  async (id, { getState }) => {
    const { user } = getState() as RootState;
    if (user.entities[id]?.friends) return { id, result: user.entities[id].friends! };
    const response = await core.userService!.getFollowingList(id);
    return { id, result: response.data };
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOne.pending, (state) => {
      state.getOneStatus = 'pending';
    });
    builder.addCase(getOne.fulfilled, (state, action) => {
      state.entities[action.payload.user_id] = action.payload;
      state.getOneStatus = 'succeeded';
    });
    builder.addCase(getOne.rejected, (state) => {
      state.getOneStatus = 'failed';
    });
    builder.addCase(search.pending, (state) => {
      state.searchStatus = 'failed';
    });
    builder.addCase(search.fulfilled, (state, action) => {
      state.search = { ...state.search, ...action.payload };
      state.searchStatus = 'succeeded';
    });
    builder.addCase(search.rejected, (state) => {
      state.searchStatus = 'failed';
    });
    builder.addCase(getFollowers.pending, (state) => {
      state.searchStatus = 'failed';
    });
    builder.addCase(getFollowers.fulfilled, (state, action) => {
      state.entities[action.payload.id].followers = action.payload.result;
      state.searchStatus = 'succeeded';
    });
    builder.addCase(getFollowers.rejected, (state) => {
      state.searchStatus = 'failed';
    });
    builder.addCase(getFollowing.pending, (state) => {
      state.searchStatus = 'failed';
    });
    builder.addCase(getFollowing.fulfilled, (state, action) => {
      state.entities[action.payload.id].friends = action.payload.result;
      state.searchStatus = 'succeeded';
    });
    builder.addCase(getFollowing.rejected, (state) => {
      state.searchStatus = 'failed';
    });
  },
});

export const selectGetOne = (state: RootState) => state.user.entities;
export const selectGetOneStatus = (state: RootState) => state.user.getOneStatus;
export const selectSearchResult = (state: RootState) => state.user.search;
export const selectSearchStatus = (state: RootState) => state.user.searchStatus;
export default userSlice.reducer;
