import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: UserState = {
  totalScore: 0,
  dailyScore: 0,
  scores: {},
};

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: () => initialState,
    update: (_, action: PayloadAction<UserState>) => action.payload,
    addScoreDaily: (state: UserState, action: PayloadAction<number>) => ({
      ...state,
      dailyScore: state.dailyScore + action.payload,
    }),
  },
});

export default user.reducer;
