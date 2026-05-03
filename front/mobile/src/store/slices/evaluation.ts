import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type EvaluationState = {
  items: {
    kanji: KanjiType;
    score?: number | null;
  }[];
  currentIndex: number;
  status: RequestStatusType;
};

const initialState: EvaluationState = {
  items: [],
  currentIndex: 0,
  status: 'idle',
};

const init = createAsyncThunk('evaluation/init', async () => {
  console.log('init');
  // const response = await core.get('/evaluation/init');
  // return response.data;
});

const getPendingEvaluation = createAsyncThunk('evaluation/getEvaluation', async () => {
  console.log('getPendingEvaluation');
  // const response = await core.get('/evaluation/pending');
  // return response.data;
});

const getHistory = createAsyncThunk('evaluation/getHistory', async () => {
  console.log('getHistory');
  // const response = await core.get('/evaluation/history');
  // return response.data;
});

const saveEvaluation = createAsyncThunk('evaluation/saveEvaluation', async (evaluation) => {
  console.log('saveEvaluation');
  // const response = await core.post('/evaluation', evaluation);
  // return response.data;
});

const updateItem = createAsyncThunk('evaluation/updateItem', async (item) => {
  console.log('updateItem with image to upload:', item);
  // const response = await core.patch(`/evaluation/${item}`, item);
  // return response.data;
});

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
    builder.addCase(updateItem.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(updateItem.fulfilled, (state, action) => {
      state.status = 'succeeded';
    });
    builder.addCase(updateItem.rejected, (state) => {
      state.status = 'failed';
    });
  },
});
export default evaluationSlice.reducer;
