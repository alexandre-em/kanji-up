import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: SelectedKanjiState = {
  selectedKanji: {},
  toAdd: {},
  toRemove: {},
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
  if (state.selectedKanji[action.payload.kanji_id]) { return state; }

  return { ...state, toAdd: { ...state.toAdd, [action.payload.kanji_id]: action.payload } };
};

const unSelectKanji = (state: SelectedKanjiState, action: PayloadAction<KanjiType>) => {
  if (state.toAdd[action.payload.kanji_id]) {
    const unSelectedKanji = state.toAdd;
    delete unSelectedKanji[action.payload.kanji_id];

    return { ... state, toAdd: unSelectedKanji };
  }

  return { ...state, toRemove: { ...state.toRemove, [action.payload.kanji_id]: action.payload } };
};

const save = (state: SelectedKanjiState) => {
  const selectedKanji = { ...state.selectedKanji, ...state.toAdd };
  Object.keys(state.toRemove).forEach((id) => {
    delete selectedKanji[id];
  });

  return { ...state, selectedKanji, toAdd: {}, toRemove: {} };
};

export const kanji = createSlice({
  name: 'kanji',
  initialState,
  reducers: {
    initialize,
    updateStatus,
    selectKanji,
    unSelectKanji,
    save,
  },
});

export default kanji.reducer;

