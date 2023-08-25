import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KanjiType } from 'kanji-app-types';

const initialState: SelectedKanjiState = {
  selectedKanji: {},
  toAdd: {},
  toRemove: {},
  progression: {},
  status: 'pending',
};

const initialize = (state: SelectedKanjiState, action: PayloadAction<string>) => {
  const loadingState: SelectedKanjiState = { ...state, status: 'pending' };

  return {
    ...loadingState,
    selectedKanji: JSON.parse(action.payload) as { [key: string]: Partial<KanjiType> },
  };
};

const updateStatus = (state: SelectedKanjiState, action: PayloadAction<'done' | 'inProgress' | 'error' | 'pending'>) => {
  return { ...state, status: action.payload };
};

const selectKanji = (state: SelectedKanjiState, action: PayloadAction<KanjiType>) => {
  if (state.selectedKanji[action.payload.kanji_id] && !state.toRemove[action.payload.kanji_id]) {
    return state;
  }

  const toRemove: { [id: string]: Partial<KanjiType> } = {};
  Object.keys(state.toRemove).forEach((kId) => {
    if (kId !== action.payload.kanji_id) {
      toRemove[kId] = state.toRemove[kId];
    }
  });

  return { ...state, toAdd: { ...state.toAdd, [action.payload.kanji_id]: action.payload }, toRemove };
};

const unSelectKanji = (state: SelectedKanjiState, action: PayloadAction<KanjiType>) => {
  if (state.toAdd[action.payload.kanji_id]) {
    delete state.toAdd[action.payload.kanji_id];
    return;
  }

  return { ...state, toRemove: { ...state.toRemove, [action.payload.kanji_id]: action.payload } };
};

const save = (state: SelectedKanjiState, action: PayloadAction<Function>) => {
  Object.keys(state.toRemove).forEach((id) => {
    delete state.selectedKanji[id];
    delete state.toRemove[id];
  });
  Object.keys(state.toAdd).forEach((id) => {
    state.selectedKanji[id] = state.toAdd[id];
    delete state.toAdd[id];
  });

  action.payload(state.selectedKanji);
};

const cancel = (state: SelectedKanjiState) => {
  return { ...state, toAdd: {}, toRemove: {} };
};

const reset = (state: SelectedKanjiState) => {
  return { ...state, selectedKanji: {}, toAdd: {}, toRemove: {} };
};

const updateProgression = (state: SelectedKanjiState, action: PayloadAction<{ id: string; inc: number }>) => {
  const { id, inc } = action.payload;
  const { progression } = state;
  const updateKanjiProgression = progression[id] ?? 0;

  return { ...state, progression: { ...progression, [id]: updateKanjiProgression + inc } };
};

export const kanji = createSlice({
  name: 'kanji',
  initialState,
  reducers: {
    initialize,
    cancel,
    updateStatus,
    updateProgression,
    selectKanji,
    unSelectKanji,
    save,
    reset,
  },
});

export default kanji.reducer;
