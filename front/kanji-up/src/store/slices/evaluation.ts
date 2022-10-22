import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: EvaluationState = {
  totalScore: 0,
  totalCard: 50,
  answers: [],
  status: 'notStarted',
  error: null,
};

const initialize = (state: EvaluationState) => {
  const loadingState: EvaluationState = { ...state, status: 'inProgress' };

  return {
    ...loadingState,
    // set saved params in AsyncStorage (totalCard, )
  }
};

const addAnswer = (state: EvaluationState, action: PayloadAction<AnswerType>) => {
  return { ...state, answers: [...state.answers, action.payload]};
};

const finish = (state: EvaluationState) => {
  return { ...state, status: 'done' } as EvaluationState;
};

const handleError = (state: EvaluationState, action: PayloadAction<Error>) => {
  const updatedStatus : Partial<EvaluationState> = { status: 'error', error: action.payload };

  return { ...state, ...updatedStatus };
}

export const evaluation = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    initialize,
    addAnswer,
    handleError,
    finish,
  },
});

export default evaluation.reducer;

