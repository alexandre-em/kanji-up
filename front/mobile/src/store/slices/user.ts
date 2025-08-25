import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { core } from '../../services/http';

type GetUserInput = {
  macAddress: string;
};

const initialState: UserState = {
  name: '',
  macAddress: '',
  isAnonymous: true,
  adsDeactivated: false,
  subscriptionPlan: 'free',
  picture: null,
  providerId: null,
  subscribedAt: null,
  subscribedUntil: null,
  credits: 0,

  getUserStatus: 'idle',
  createUserStatus: 'idle',
};

export const getUser = createAsyncThunk<UserType, GetUserInput>('user/get', async ({ macAddress }) => {
  const response = await core.authService!.get(macAddress);
  return response.data;
});

export const createUser = createAsyncThunk<void, Pick<UserType, 'name' | 'macAddress'>>('user/create', async (payload) => {
  await core.authService!.create(payload);
  return;
});

export const linkUserToProvider = createAsyncThunk<void, Pick<UserType, 'email' | 'picture' | 'providerId' | 'macAddress'>>(
  'user/link',
  async (payload) => {
    await core.authService!.link(payload);
    return;
  },
);

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (state, action: PayloadAction<Partial<UserType>>) => ({ ...state, ...action.payload }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.getUserStatus = 'pending';
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.getUserStatus = 'succeeded';
        state.name = action.payload.name;
        state.macAddress = action.payload.macAddress;
        state.isAnonymous = action.payload.isAnonymous;
        state.adsDeactivated = action.payload.adsDeactivated;
        state.subscriptionPlan = action.payload.subscriptionPlan;
        state.picture = action.payload.picture;
        state.providerId = action.payload.providerId;
        state.subscribedAt = action.payload.subscribedAt;
        state.subscribedUntil = action.payload.subscribedUntil;
      })
      .addCase(getUser.rejected, (state) => {
        state.getUserStatus = 'failed';
      })
      .addCase(createUser.pending, (state) => {
        state.createUserStatus = 'pending';
      })
      .addCase(createUser.fulfilled, (state) => {
        state.createUserStatus = 'succeeded';
      })
      .addCase(createUser.rejected, (state) => {
        state.createUserStatus = 'failed';
      });
  },
});

export default user.reducer;

export const selectUserName = (state: RootState) => state.user.name;
export const selectUserPicture = (state: RootState) => state.user.picture;
export const selectUserState = (state: RootState) => state.user;
export const selectGetUserStatus = (state: RootState) => state.user.getUserStatus;
export const selectCreateStatus = (state: RootState) => state.user.createUserStatus;
