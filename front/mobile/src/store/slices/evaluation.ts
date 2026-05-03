import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'store';

type EvaluationState = {
  items: {
    kanji: Partial<KanjiType>;
    score: number | null;
    status: 'correct' | 'incorrect' | 'pending' | 'idle';
  }[];
  currentIndex: number;
  status: RequestStatusType;
};

const initialState: EvaluationState = {
  items: [],
  currentIndex: 0,
  status: 'idle',
};

export const init = createAsyncThunk(
  'evaluation/init',
  async (payload: { items: { kanji: Partial<KanjiType>; score: number | null; status: 'idle' }[] }) => {
    console.log('init');
    // const response = await core.get('/evaluation/init');
    return payload.items;
  },
);

export const getPendingEvaluation = createAsyncThunk('evaluation/getEvaluation', async () => {
  console.log('getPendingEvaluation');
  // const response = await core.get('/evaluation/pending');
  // return response.data;
});

export const getHistory = createAsyncThunk('evaluation/getHistory', async () => {
  console.log('getHistory');
  // const response = await core.get('/evaluation/history');
  // return response.data;
});

export const saveEvaluation = createAsyncThunk('evaluation/saveEvaluation', async (evaluation) => {
  console.log('saveEvaluation');
  // const response = await core.post('/evaluation', evaluation);
  // return response.data;
});

export const updateItemScore = createAsyncThunk(
  'evaluation/updateItem',
  async (payload: { result: PredictionType[]; strokesCount: number }, { getState }) => {
    const currentIndex = (getState() as RootState).evaluation.currentIndex;
    const currentKanji = (getState() as RootState).evaluation.items[currentIndex].kanji;
    const score = payload.result.find((item) => item.label === currentKanji.kanji?.character)?.confidence ?? null;
    const isAnswerCorrect = score && payload.strokesCount === currentKanji.kanji?.strokes;

    const body = {
      score: isAnswerCorrect ? score : null,
      status: (isAnswerCorrect ? 'correct' : 'incorrect') as 'correct' | 'incorrect' | 'pending' | 'idle',
    };
    console.log('updateItem with image to upload:', body);
    // const response = await core.patch(`/evaluation/${item}`, body);
    return body;
  },
);

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(init.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(init.fulfilled, (state, action) => {
      state.items = action.payload;
      state.currentIndex = 0;
      state.status = 'succeeded';
      state.items[0].status = 'pending';
    });
    builder.addCase(init.rejected, (state) => {
      state.status = 'failed';
      state.currentIndex = 0;
      state.items = [];
    });
    builder.addCase(getPendingEvaluation.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(getPendingEvaluation.fulfilled, (state, action) => {
      state.status = 'succeeded';
    });
    builder.addCase(getPendingEvaluation.rejected, (state) => {
      state.status = 'failed';
    });
    builder.addCase(getHistory.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(getHistory.fulfilled, (state, action) => {
      state.status = 'succeeded';
    });
    builder.addCase(getHistory.rejected, (state) => {
      state.status = 'failed';
    });
    builder.addCase(saveEvaluation.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(saveEvaluation.fulfilled, (state, action) => {
      state.status = 'succeeded';
    });
    builder.addCase(saveEvaluation.rejected, (state) => {
      state.status = 'failed';
    });
    builder.addCase(updateItemScore.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(updateItemScore.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items[state.currentIndex].score = action.payload.score;
      state.items[state.currentIndex].status = action.payload.status;
      state.currentIndex++;
      if (state.currentIndex < state.items.length) {
        state.items[state.currentIndex].status = 'pending';
      }
    });
    builder.addCase(updateItemScore.rejected, (state) => {
      state.status = 'failed';
    });
  },
});
export default evaluationSlice.reducer;

export const selectEvaluationItems = (state: RootState) => state.evaluation.items;
export const selectCurrentIndex = (state: RootState) => state.evaluation.currentIndex;
