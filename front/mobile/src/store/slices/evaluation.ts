import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';

/** Verdict of the recognition model on a drawing */
type AnswerStatusType = 'idle' | 'correct' | 'incorrect' | 'review';

export type EvaluationItemType = {
  kanji: Partial<KanjiType>;
  /** Confidence of the expected kanji, when the model recognized it */
  score: number | null;
  /** 'review' means the model did not recognize the drawing: only the user can tell */
  status: AnswerStatusType;
  /** Base64 of the drawing, kept so the user can judge it on the result screen */
  image: string | null;
  /** Strokes actually drawn, to explain a stroke count mismatch */
  strokesCount: number;
  /** User verdict on a 'review' answer, null while undecided */
  userConfirmation: boolean | null;
};

type EvaluationState = {
  items: EvaluationItemType[];
  currentIndex: number;
  status: RequestStatusType;
};

const initialState: EvaluationState = {
  items: [],
  currentIndex: 0,
  status: 'idle',
};

/** Status actually shown to the user: on a 'review' answer, their own verdict wins */
export function getEffectiveStatus(item: EvaluationItemType): AnswerStatusType {
  if (item.status !== 'review' || item.userConfirmation === null) return item.status;

  return item.userConfirmation ? 'correct' : 'incorrect';
}

export const init = createAsyncThunk('evaluation/init', async (payload: { kanjis: Partial<KanjiType>[] }) => {
  console.log('init');
  // const response = await core.get('/evaluation/init');
  return payload.kanjis;
});

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
  async (payload: { result: PredictionType[]; strokesCount: number; image: string | null }, { getState }) => {
    const currentIndex = (getState() as RootState).evaluation.currentIndex;
    const expected = (getState() as RootState).evaluation.items[currentIndex].kanji.kanji;
    const prediction = payload.result.find((item) => item.label === expected?.character);

    // No drawing (timed out, hence no image, or an empty canvas) and a wrong stroke count are
    // objectively wrong: there is nothing for the user to arbitrate — and a 'review' answer must
    // always carry an image, since judging it means looking at it. A right stroke count the model
    // failed to recognize is the doubtful case they confirm themselves on the result screen.
    let status: AnswerStatusType = 'review';
    if (
      !payload.image ||
      payload.strokesCount === 0 ||
      (expected?.strokes !== undefined && payload.strokesCount !== expected.strokes)
    ) {
      status = 'incorrect';
    } else if (prediction) {
      status = 'correct';
    }

    const body = {
      score: status === 'correct' ? (prediction?.confidence ?? null) : null,
      status,
      image: payload.image,
      strokesCount: payload.strokesCount,
    };
    console.log('updateItem with image to upload:', { ...body, image: !!body.image });
    // const response = await core.patch(`/evaluation/${item}`, body);
    return body;
  },
);

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    /** User verdict on a doubtful answer, changeable until the result is validated */
    confirmItem: (state, action: PayloadAction<{ index: number; isCorrect: boolean }>) => {
      const item = state.items[action.payload.index];

      if (!item || item.status !== 'review') return;

      item.userConfirmation = action.payload.isCorrect;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(init.pending, (state) => {
      state.status = 'pending';
    });
    builder.addCase(init.fulfilled, (state, action) => {
      state.items = action.payload.map((kanji) => ({
        kanji,
        score: null,
        status: 'idle' as AnswerStatusType,
        image: null,
        strokesCount: 0,
        userConfirmation: null,
      }));
      state.currentIndex = 0;
      state.status = 'succeeded';
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
      state.items[state.currentIndex] = { ...state.items[state.currentIndex], ...action.payload };
      state.currentIndex++;
    });
    builder.addCase(updateItemScore.rejected, (state) => {
      state.status = 'failed';
    });
  },
});

export const { confirmItem, reset } = evaluationSlice.actions;
export default evaluationSlice.reducer;

export const selectEvaluationItems = (state: RootState) => state.evaluation.items;
export const selectCurrentIndex = (state: RootState) => state.evaluation.currentIndex;
/** Answers still waiting for the user to arbitrate: blocks the result validation */
export const selectPendingReviewCount = (state: RootState) =>
  state.evaluation.items.filter((item) => item.status === 'review' && item.userConfirmation === null).length;
export const selectCorrectCount = (state: RootState) =>
  state.evaluation.items.filter((item) => getEffectiveStatus(item) === 'correct').length;
