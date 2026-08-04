import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { clampProgression } from '../../constants/progression';
import { core } from '../../services/http';
import { completeMissionTask } from './missions';

type GetUserInput = {
  macAddress: string;
};

const SCORE_HISTORY_DAYS = 30;

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
  totalScore: 0,
  dailyScores: {},
  progression: {},

  getUserStatus: 'idle',
  createUserStatus: 'idle',
};

function todayLocal(): string {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

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

// Best-effort, fire-and-forget: a network hiccup here shouldn't block or surface an error to the
// user, the local state (already incremented live per answer) is what actually matters
export const syncKanjiProgression = createAsyncThunk('user/syncKanjiProgression', async (_: void, { getState }) => {
  const { macAddress, totalScore, dailyScores, progression } = (getState() as RootState).user;
  if (!macAddress) return;

  await core.authService!.updateKanjiProgression(macAddress, { totalScore, dailyScores, progression }).catch(() => undefined);
});

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (state, action: PayloadAction<Partial<UserType>>) => ({ ...state, ...action.payload }),
    updateProgression: (state, action: PayloadAction<{ id: string; inc: number }>) => {
      const { id, inc } = action.payload;

      state.progression[id] = clampProgression(state.progression[id] ?? 0, inc);
    },
    addScore: (state, action: PayloadAction<number>) => {
      const today = todayLocal();

      state.dailyScores[today] = (state.dailyScores[today] ?? 0) + action.payload;
      state.totalScore += action.payload;

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - SCORE_HISTORY_DAYS);
      Object.keys(state.dailyScores).forEach((date) => {
        if (new Date(date) < cutoff) delete state.dailyScores[date];
      });
    },
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
        state.totalScore = action.payload.totalScore;
        state.dailyScores = action.payload.dailyScores;
        state.progression = action.payload.progression;
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
      })
      .addCase(completeMissionTask.fulfilled, (state, action) => {
        state.credits += action.payload.creditsGranted;
      });
  },
});

export default user.reducer;

export const selectUserName = (state: RootState) => state.user.name;
export const selectUserPicture = (state: RootState) => state.user.picture;
export const selectUserState = (state: RootState) => state.user;
export const selectGetUserStatus = (state: RootState) => state.user.getUserStatus;
export const selectCreateStatus = (state: RootState) => state.user.createUserStatus;
