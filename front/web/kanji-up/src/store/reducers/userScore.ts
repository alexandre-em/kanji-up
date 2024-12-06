import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { core } from '../../shared';

type GetScoreInput = {
  id: string;
  accessToken?: string;
};

type UserScoreState = {
  [app: string]: UserState;
};

const initialState: UserScoreState = {
  word: {
    total_score: 0,
    dailyScore: 0,
    scores: {},
    progression: {},
    status: 'idle',
  },
  kanji: {
    total_score: 0,
    dailyScore: 0,
    scores: {},
    progression: {},
    status: 'idle',
  },
};

const updateProgression = (state: UserScoreState, action: PayloadAction<{ id: string; app: AppType; inc: number }>) => {
  const { id, inc, app } = action.payload;
  const { progression } = state[app];
  const updateKanjiProgression = progression[id] ?? 0;

  const incrementedProgression = Math.min(updateKanjiProgression + inc, 100);

  return {
    ...state,
    [app]: {
      ...state[app],
      progression: { ...progression, [id]: incrementedProgression },
    },
  };
};

export const getKanjiScore = createAsyncThunk<UserScore, GetScoreInput>('userScore/kanji', async ({ id }) => {
  const response = await core.userService!.getScore!(id, 'kanji');
  return response.data;
});

export const getWordScore = createAsyncThunk<UserScore, GetScoreInput>('userScore/word', async ({ id }) => {
  const response = await core.userService!.getScore!(id, 'word');
  return response.data;
});

export const userScore = createSlice({
  name: 'userScore',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (_, action: PayloadAction<UserScoreState>) => action.payload,
    addScoreDaily: (state: UserScoreState, action: PayloadAction<{ score: number; app: AppType }>) => ({
      ...state,
      [action.payload.app]: {
        ...state[action.payload.app],
        dailyScore: (state[action.payload.app].dailyScore || 0) + action.payload.score,
      },
    }),
    updateProgression,
  },
  extraReducers: (builder) => {
    builder.addCase(getKanjiScore.pending, (state) => {
      state.kanji.status = 'pending';
    });
    builder.addCase(getKanjiScore.fulfilled, (state, action) => {
      const date = new Date();
      state.kanji = {
        ...action.payload,
        status: 'succeeded',
        dailyScore: action.payload.scores[`${date.getFullYear()}-${date.getMonth()}-${date.getDay() || 0}`],
      };
    });
    builder.addCase(getKanjiScore.rejected, (state) => {
      state.kanji.status = 'failed';
    });
    builder.addCase(getWordScore.pending, (state) => {
      state.word.status = 'pending';
    });
    builder.addCase(getWordScore.fulfilled, (state, action) => {
      const date = new Date();
      state.word = {
        ...action.payload,
        status: 'succeeded',
        dailyScore: action.payload.scores[`${date.getFullYear()}-${date.getMonth()}-${date.getDay() || 0}`],
      };
    });
    builder.addCase(getWordScore.rejected, (state) => {
      state.word.status = 'failed';
    });
  },
});

export default userScore.reducer;
