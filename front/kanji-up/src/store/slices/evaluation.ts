import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: EvaluationState = {
  totalScore: 0,
  totalCard: 50,
  time: 60,
  answers: [],
  status: 'notStarted',
  error: null,
};

const initialize = (state: EvaluationState, action: PayloadAction<{ time: number, totalCard: number }>) => {
  const { time, totalCard } = action.payload;
  const loadingState: EvaluationState = { ...state, status: 'inProgress' };

  return {
    ...loadingState,
    time,
    totalCard,
  }
};

const addAnswer = (state: EvaluationState, action: PayloadAction<AnswerType>) => {
  return { ...state, answers: [...state.answers, action.payload]};
};

const updateAnswerStatus = (state: EvaluationState, action: PayloadAction<{ id: number, status: string, message: string }>) => {
  if (action.payload.status !== 'correct'
  && action.payload.status !== 'incorrect'
  && action.payload.status !== 'toReview') return state;

  const newState = state;
  state.answers[action.payload.id].status = action.payload.status;
  state.answers[action.payload.id].message = action.payload.message;

  return newState;
}

const finish = (state: EvaluationState) => {
  return { ...state, status: 'done' } as EvaluationState;
};

const handleError = (state: EvaluationState, action: PayloadAction<Error>) => {
  const updatedStatus : Partial<EvaluationState> = { status: 'error', error: action.payload };

  return { ...state, ...updatedStatus };
}

const reset = (state: EvaluationState, action: PayloadAction<{ time: number, totalCard: number }>) => {
  const { time, totalCard } = action.payload;

  return ({
    ...initialState,
    totalCard,
    time,
  })
};

export const evaluation = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    initialize,
    addAnswer,
    updateAnswerStatus,
    handleError,
    finish,
    reset,
  },
});

export default evaluation.reducer;
