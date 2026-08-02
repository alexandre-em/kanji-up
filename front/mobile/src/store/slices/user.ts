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
  unlockedDifficulties: [],
  unlockedKanji: [],

  getUserStatus: 'idle',
  createUserStatus: 'idle',
};

export const getUser = createAsyncThunk<UserType, GetUserInput>('user/get', async ({ macAddress }) => {
  try {
    const response = await core.authService!.get(macAddress);

    return response.data;
  } catch (error) {
    console.error('Error getting user', error);
    return null;
  }
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

export const earnCredits = createAsyncThunk<{ creditsEarned: number }, { macAddress: string }>(
  'user/earnCredits',
  async ({ macAddress }) => {
    const response = await core.authService!.earnCredits(macAddress);
    return response!.data;
  },
);

type UnlockContentInput = {
  macAddress: string;
  scope: 'kanji' | 'tier';
  tier: string;
  kanjiId?: string;
};

export const unlockContent = createAsyncThunk<{ creditsSpent: number }, UnlockContentInput>(
  'user/unlockContent',
  async ({ macAddress, scope, tier, kanjiId }) => {
    const response = await core.authService!.unlockContent(macAddress, { scope, tier, kanjiId });
    return response!.data;
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
        state.credits = action.payload.credits;
        state.unlockedDifficulties = action.payload.unlockedDifficulties;
        state.unlockedKanji = action.payload.unlockedKanji;
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
      })
      .addCase(earnCredits.fulfilled, (state, action) => {
        state.credits += action.payload.creditsEarned;
      })
      .addCase(unlockContent.fulfilled, (state, action) => {
        state.credits -= action.payload.creditsSpent;
        const { scope, tier, kanjiId } = action.meta.arg;
        if (scope === 'kanji') state.unlockedKanji.push(kanjiId!);
        else state.unlockedDifficulties.push(tier);
      });
  },
});

export default user.reducer;

export const selectUserName = (state: RootState) => state.user.name;
export const selectUserPicture = (state: RootState) => state.user.picture;
export const selectUserState = (state: RootState) => state.user;
export const selectGetUserStatus = (state: RootState) => state.user.getUserStatus;
export const selectCreateStatus = (state: RootState) => state.user.createUserStatus;
