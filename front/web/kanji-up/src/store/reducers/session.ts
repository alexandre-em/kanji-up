import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

import { RootState } from '..';
import { ACCESS_TOKEN } from '../../constants';
import core from '../../shared/services';

type SessionStateType = {
  accessToken: string;
  refreshToken?: string;
  name: string;
  email: string;
  userId: string;
  iat?: number;
  exp?: number;
  status?: RequestStatusType;
};

const initialState: SessionStateType = {
  accessToken: '',
  name: 'User',
  email: 'email.kanjiup.fr',
  userId: '',
  status: 'idle',
};

export const isLoggedIn = createAsyncThunk<boolean>('session/check', async () => {
  const result = await core.checkSession();

  return JSON.parse(result.data);
});

const init = (state: SessionStateType, action: PayloadAction<string>) => {
  const accessToken = action.payload;

  core.init(accessToken);
  if (!localStorage.getItem(ACCESS_TOKEN)) localStorage.setItem(ACCESS_TOKEN, accessToken);

  return { ...state, ...(jwtDecode(accessToken) as SessionStateType), accessToken };
};

const reset = () => {
  core.init('');
  localStorage.removeItem(ACCESS_TOKEN);
  return initialState;
};

export const session = createSlice({
  name: 'session',
  initialState,
  reducers: {
    init,
    reset,
  },
  extraReducers: (builder) => {
    builder.addCase(isLoggedIn.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(isLoggedIn.fulfilled, (state, action) => {
      if (!action.payload) {
        state = initialState;
      } else state.status = 'succeeded';
    });
    builder.addCase(isLoggedIn.rejected, (state) => {
      state.status = 'failed';
    });
  },
});

export default session.reducer;
export const selectCheckStatus = (state: RootState) => state.session.status;
