import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { fileNames, fileServiceInstance } from '../../services/file';

export type KanjiProgressType = {
  success: number;
  failure: number;
  lastTestedAt: string;
};

type ProgressionState = {
  scores: { [kanjiId: string]: KanjiProgressType };
  status: RequestStatusType;
};

const initialState: ProgressionState = {
  scores: {},
  status: 'idle',
};

export const initialize = createAsyncThunk<ProgressionState['scores']>('progression/init', async () => {
  const content = await fileServiceInstance.read(fileNames.USER_SCORES);

  return content ?? {};
});

/** One entry per tested kanji, correct meaning the user's final effective verdict, model or self-confirmed */
export const recordResults = createAsyncThunk(
  'progression/recordResults',
  async (results: { kanjiId: string; isCorrect: boolean }[], { getState }) => {
    const { scores } = (getState() as RootState).progression;
    const testedAt = new Date().toISOString();

    const nextScores = { ...scores };
    results.forEach(({ kanjiId, isCorrect }) => {
      const previous = nextScores[kanjiId] ?? { success: 0, failure: 0, lastTestedAt: testedAt };

      nextScores[kanjiId] = {
        success: previous.success + (isCorrect ? 1 : 0),
        failure: previous.failure + (isCorrect ? 0 : 1),
        lastTestedAt: testedAt,
      };
    });

    await fileServiceInstance.write(fileNames.USER_SCORES, JSON.stringify(nextScores));

    return nextScores;
  },
);

const progressionSlice = createSlice({
  name: 'progression',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.scores = action.payload;
      state.status = 'succeeded';
    });
    builder.addCase(initialize.rejected, (state) => {
      state.status = 'failed';
    });
    builder.addCase(recordResults.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(recordResults.fulfilled, (state, action) => {
      state.scores = action.payload;
      state.status = 'succeeded';
    });
    builder.addCase(recordResults.rejected, (state) => {
      state.status = 'failed';
    });
  },
});

export default progressionSlice.reducer;

export const selectKanjiScores = (state: RootState) => state.progression.scores;
