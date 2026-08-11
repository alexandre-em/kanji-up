import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { RootState } from 'store';

import { normalizeProgressionEntry } from '../../constants/progression';
import { core } from '../../services/http';
import { completeMissionTask } from './missions';

// Bootstrap (first launch, no stored userId yet) resolves by device macAddress; every other
// refresh (e.g. after account recovery) resolves by the stable userId
type GetUserInput = { macAddress: string } | { userId: string };

const SCORE_HISTORY_DAYS = 30;

const initialState: UserState = {
  userId: '',
  name: '',
  macAddress: '',
  isAnonymous: true,
  adsDeactivated: false,
  subscriptionPlan: 'free',
  email: null,
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
  wordProgression: {},

  getUserStatus: 'idle',
  createUserStatus: 'idle',
};

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function todayLocal(): string {
  return localDateKey(new Date());
}

export const getUser = createAsyncThunk<UserType, GetUserInput, { rejectValue: { status?: number } }>(
  'user/get',
  async (input, { rejectWithValue }) => {
    try {
      const response =
        'userId' in input ? await core.authService!.get(input.userId) : await core.authService!.getByMacAddress(input.macAddress);

      return response.data;
    } catch (error) {
      // Surfaced so callers can tell "account genuinely doesn't exist" (404) apart from a
      // transient failure (network, 5xx) — createAsyncThunk's default error serialization drops
      // the response status otherwise
      return rejectWithValue({ status: isAxiosError(error) ? error.response?.status : undefined });
    }
  },
);

export const createUser = createAsyncThunk<void, Pick<UserType, 'name' | 'macAddress'>>('user/create', async (payload) => {
  await core.authService!.create(payload);
  return;
});

// Refetches the full profile afterward: on a migrated (recovered) account, name/credits/progression/
// everything just changed to a different userId, a manual field merge isn't worth it. The returned
// userId is authoritative — if migrated, it's a different (older, recovered) account than the one
// passed in, and getUser refetches using it.
export const recoverAccount = createAsyncThunk<{ userId: string; migrated: boolean }, { userId: string; idToken: string }>(
  'user/recoverAccount',
  async ({ userId, idToken }, { dispatch }) => {
    const response = await core.authService!.recoverAccount(userId, idToken);
    await dispatch(getUser({ userId: response.data.userId }));

    return response.data;
  },
);

export const earnCredits = createAsyncThunk<{ creditsEarned: number }, { userId: string }>(
  'user/earnCredits',
  async ({ userId }) => {
    const response = await core.authService!.earnCredits(userId);
    return response!.data;
  },
);

type UnlockContentInput = {
  userId: string;
  scope: 'kanji' | 'tier';
  tier: string;
  kanjiId?: string;
};

export const unlockContent = createAsyncThunk<{ creditsSpent: number }, UnlockContentInput>(
  'user/unlockContent',
  async ({ userId, scope, tier, kanjiId }) => {
    const response = await core.authService!.unlockContent(userId, { scope, tier, kanjiId });
    return response!.data;
  },
);

// Best-effort, fire-and-forget: a network hiccup here shouldn't block or surface an error to the
// user, the local state (already incremented live per answer) is what actually matters
export const syncKanjiProgression = createAsyncThunk('user/syncKanjiProgression', async (_: void, { getState }) => {
  const { userId, totalScore, dailyScores, progression, wordProgression } = (getState() as RootState).user;
  if (!userId) return;

  await core
    .authService!.updateKanjiProgression(userId, { totalScore, dailyScores, progression, wordProgression })
    .catch(() => undefined);
});

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (state, action: PayloadAction<Partial<UserType>>) => ({ ...state, ...action.payload }),
    updateProgression: (state, action: PayloadAction<{ id: string; correct: boolean }>) => {
      const { id, correct } = action.payload;
      const current = normalizeProgressionEntry(state.progression[id]);

      state.progression[id] = { correct: current.correct + (correct ? 1 : 0), total: current.total + 1 };
    },
    updateWordProgression: (state, action: PayloadAction<{ id: string; correct: boolean }>) => {
      const { id, correct } = action.payload;
      const current = state.wordProgression[id] ?? { correct: 0, total: 0 };

      state.wordProgression[id] = { correct: current.correct + (correct ? 1 : 0), total: current.total + 1 };
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
        state.userId = action.payload.userId;
        state.name = action.payload.name;
        state.macAddress = action.payload.macAddress;
        state.isAnonymous = action.payload.isAnonymous;
        state.adsDeactivated = action.payload.adsDeactivated;
        state.subscriptionPlan = action.payload.subscriptionPlan;
        state.email = action.payload.email;
        state.picture = action.payload.picture;
        state.providerId = action.payload.providerId;
        state.subscribedAt = action.payload.subscribedAt;
        state.subscribedUntil = action.payload.subscribedUntil;
        state.credits = action.payload.credits;
        // Server response can omit these (e.g. an account created before progression tracking
        // existed) — downstream code assumes an object/array is always there (.includes(),
        // bracket access, Object.values()), so a missing field must fall back, not propagate as
        // undefined and crash the first screen that reads it
        state.unlockedDifficulties = action.payload.unlockedDifficulties ?? [];
        state.unlockedKanji = action.payload.unlockedKanji ?? [];
        state.totalScore = action.payload.totalScore ?? 0;
        state.dailyScores = action.payload.dailyScores ?? {};
        state.progression = action.payload.progression ?? {};
        state.wordProgression = action.payload.wordProgression ?? {};
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
