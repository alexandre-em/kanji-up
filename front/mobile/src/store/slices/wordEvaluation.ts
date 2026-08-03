import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { core } from '../../services/http';

type AnswerStatusType = 'idle' | 'correct' | 'incorrect' | 'review';

export type WordSlotType = {
  image: string | null;
  predictions: PredictionType[];
  strokesCount: number;
};

export type WordEvaluationItemType = {
  word: Partial<WordType>;
  slots: WordSlotType[];
  status: AnswerStatusType;
  userConfirmation: boolean | null;
};

type WordEvaluationState = {
  items: WordEvaluationItemType[];
  currentIndex: number;
  status: RequestStatusType;
};

const initialState: WordEvaluationState = {
  items: [],
  currentIndex: 0,
  status: 'idle',
};

export function getEffectiveStatus(item: WordEvaluationItemType): AnswerStatusType {
  if (item.status !== 'review' || item.userConfirmation === null) return item.status;

  return item.userConfirmation ? 'correct' : 'incorrect';
}

const KANJI_REGEX = /[一-鿿㐀-䶿]/;

export function getKanjiCharacters(word: string): string[] {
  return Array.from(word).filter((character) => KANJI_REGEX.test(character));
}

export const init = createAsyncThunk('wordEvaluation/init', async (payload: { number?: number } | undefined, { getState }) => {
  const selectedKanji = (getState() as RootState).selectedKanji.selectedKanji;
  const characters = Object.values(selectedKanji)
    .map((kanji) => kanji.kanji?.character)
    .filter((character): character is string => !!character);

  const response = await core.wordService!.getPracticeWords(characters, payload?.number ?? 10);
  return response.data;
});

export const updateItemSlots = createAsyncThunk(
  'wordEvaluation/updateItemSlots',
  async (payload: { slots: WordSlotType[] }, { getState }) => {
    const state = getState() as RootState;
    const currentIndex = state.wordEvaluation.currentIndex;
    const expected = state.wordEvaluation.items[currentIndex].word.word?.[0] ?? '';
    const expectedCharacters = getKanjiCharacters(expected);

    // Kanji progression is shared with the kanji-only evaluation flow, which rejects a wrong
    // stroke count outright — without this, drawing badly here would be the easy way to inflate
    // the same shared score
    const strokesByCharacter: Record<string, number> = {};
    Object.values(state.selectedKanji.selectedKanji).forEach((kanji) => {
      if (kanji.kanji?.character && kanji.kanji.strokes !== undefined)
        strokesByCharacter[kanji.kanji.character] = kanji.kanji.strokes;
    });

    let status: AnswerStatusType = 'review';
    const hasEmptySlot = payload.slots.some((slot) => !slot.image || slot.strokesCount === 0);
    const hasWrongStrokeCount = payload.slots.some((slot, index) => {
      const expectedStrokes = strokesByCharacter[expectedCharacters[index]];
      return expectedStrokes !== undefined && slot.strokesCount !== expectedStrokes;
    });

    if (payload.slots.length !== expectedCharacters.length || hasEmptySlot || hasWrongStrokeCount) {
      status = 'incorrect';
    } else if (
      payload.slots.every((slot, index) => slot.predictions.some((prediction) => prediction.label === expectedCharacters[index]))
    ) {
      status = 'correct';
    }

    return { slots: payload.slots, status };
  },
);

const wordEvaluationSlice = createSlice({
  name: 'wordEvaluation',
  initialState,
  reducers: {
    confirmItem: (state, action: PayloadAction<{ index: number; isCorrect: boolean }>) => {
      const item = state.items[action.payload.index];

      if (!item || item.status !== 'review') return;

      item.userConfirmation = action.payload.isCorrect;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(init.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(init.fulfilled, (state, action) => {
        state.items = action.payload.map((word) => ({
          word,
          slots: [],
          status: 'idle' as AnswerStatusType,
          userConfirmation: null,
        }));
        state.currentIndex = 0;
        state.status = 'succeeded';
      })
      .addCase(init.rejected, (state) => {
        state.status = 'failed';
        state.currentIndex = 0;
        state.items = [];
      })
      .addCase(updateItemSlots.fulfilled, (state, action) => {
        state.items[state.currentIndex] = { ...state.items[state.currentIndex], ...action.payload };
        state.currentIndex++;
      });
  },
});

export const { confirmItem, reset } = wordEvaluationSlice.actions;
export default wordEvaluationSlice.reducer;

export const selectWordEvaluationItems = (state: RootState) => state.wordEvaluation.items;
export const selectWordCurrentIndex = (state: RootState) => state.wordEvaluation.currentIndex;
export const selectWordEvaluationStatus = (state: RootState) => state.wordEvaluation.status;
export const selectWordPendingReviewCount = (state: RootState) =>
  state.wordEvaluation.items.filter((item) => item.status === 'review' && item.userConfirmation === null).length;
export const selectWordCorrectCount = (state: RootState) =>
  state.wordEvaluation.items.filter((item) => getEffectiveStatus(item) === 'correct').length;
