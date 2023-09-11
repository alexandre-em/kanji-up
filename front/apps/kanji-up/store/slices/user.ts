import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: UserState = {
  totalScore: 0,
  dailyScore: 0,
  scores: {},
  progression: {},
};

const updateProgression = (state: UserState, action: PayloadAction<{ id: string; inc: number }>) => {
  const { id, inc } = action.payload;
  const { progression } = state;
  const updateKanjiProgression = progression[id] ?? 0;

  const incrementedProgression = Math.min(updateKanjiProgression + inc, 100);

  return { ...state, progression: { ...progression, [id]: incrementedProgression } };
};

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (_, action: PayloadAction<UserState>) => action.payload,
    addScoreDaily: (state: UserState, action: PayloadAction<number>) => ({
      ...state,
      dailyScore: (state.dailyScore || 0) + action.payload,
    }),
    updateProgression,
  },
});

export default user.reducer;
