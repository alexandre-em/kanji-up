import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { core } from '../../services/http';

export type AnswerStatusType = 'idle' | 'correct' | 'incorrect' | 'review';

export type WordEvaluationKind = 'kanji' | 'word';

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

export const KANJI_REGEX = /[一-鿿㐀-䶿]/;

export function getKanjiCharacters(word: string): string[] {
  return Array.from(word).filter((character) => KANJI_REGEX.test(character));
}

/** Progression deltas for a finished (or abandoned) word-evaluation run, recomputed from the
 * items themselves — same resilience reasoning as the kanji evaluation's own
 * computeProgressionDeltas: items survive an app kill, in-memory Redux state doesn't. */
export function computeWordProgressionDeltas(items: WordEvaluationItemType[]): { id: string; correct: boolean }[] {
  const deltas: { id: string; correct: boolean }[] = [];

  items.forEach((item) => {
    const wordId = item.word.word_id;
    if (!wordId) return;

    if (item.status === 'correct') {
      deltas.push({ id: wordId, correct: true });
    } else if (item.status === 'incorrect') {
      // A word with every slot left empty doesn't count as an attempt — same as a kanji skip
      const isSkip = item.slots.every((slot) => !slot.image || slot.strokesCount === 0);
      if (!isSkip) deltas.push({ id: wordId, correct: false });
    } else if (item.status === 'review' && item.userConfirmation !== null) {
      deltas.push({ id: wordId, correct: item.userConfirmation });
    }
  });

  return deltas;
}

// Fisher-Yates partial shuffle — picks `count` items without replacement, order otherwise
// unspecified. A no-op (returns the input as-is) when there's nothing to trim.
export function sampleWords(words: WordType[], count: number): WordType[] {
  if (words.length <= count) return words;

  const pool = [...words];
  for (let i = pool.length - 1; i > pool.length - 1 - count; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(pool.length - count);
}

// Kanji mode: unchanged, generates a practice set from the active kanji list's characters via
// the backend. Word mode: the user already hand-picked these words — no generation needed, just
// resolve them (assumes state.word.entities is already populated by the caller) and cap the
// session length the same way kanji mode does.
export const init = createAsyncThunk(
  'wordEvaluation/init',
  async (payload: { kind?: WordEvaluationKind; number?: number } | undefined, { getState }) => {
    const state = getState() as RootState;
    const number = payload?.number ?? 10;
    const kind = payload?.kind ?? 'kanji';

    if (kind === 'word') {
      const activeList = state.wordLists.activeListId ? state.wordLists.lists[state.wordLists.activeListId] : undefined;
      const words = (activeList?.wordIds ?? []).map((id) => state.word.entities[id]).filter((word): word is WordType => !!word);

      return sampleWords(words, number);
    }

    const activeList = state.lists.activeListId ? state.lists.lists[state.lists.activeListId] : undefined;
    const characters = (activeList?.kanjiIds ?? [])
      .map((id) => state.kanji.entities[id]?.kanji?.character)
      .filter((character): character is string => !!character);

    const response = await core.wordService!.getPracticeWords(characters, number);
    return response.data;
  },
);

// Pure so it's testable without mocking Redux state — the thunk below only assembles
// strokesByCharacter from state, this decides the actual verdict from that plus the drawing.
export function computeSlotStatus(
  slots: WordSlotType[],
  expectedCharacters: string[],
  strokesByCharacter: Record<string, number>,
): AnswerStatusType {
  const hasEmptySlot = slots.some((slot) => !slot.image || slot.strokesCount === 0);
  const hasWrongStrokeCount = slots.some((slot, index) => {
    const expectedStrokes = strokesByCharacter[expectedCharacters[index]];
    return expectedStrokes !== undefined && slot.strokesCount !== expectedStrokes;
  });

  if (slots.length !== expectedCharacters.length || hasEmptySlot || hasWrongStrokeCount) return 'incorrect';

  if (slots.every((slot, index) => slot.predictions.some((prediction) => prediction.label === expectedCharacters[index]))) {
    return 'correct';
  }

  return 'review';
}

export const updateItemSlots = createAsyncThunk(
  'wordEvaluation/updateItemSlots',
  async (payload: { slots: WordSlotType[] }, { getState }) => {
    const state = getState() as RootState;
    const currentIndex = state.wordEvaluation.currentIndex;
    const expected = state.wordEvaluation.items[currentIndex].word.word?.[0] ?? '';
    const expectedCharacters = getKanjiCharacters(expected);

    // Resolved per character actually in the word being practiced, via the kanji search cache —
    // not from any active list. A practiced word can (and often does) contain kanji outside
    // whichever list seeded or selected it, kanji-mode included.
    const strokesByCharacter: Record<string, number> = {};
    expectedCharacters.forEach((character) => {
      const match = state.kanji.search[character]?.results.find((entry) => entry.kanji?.character === character);
      if (match?.kanji?.strokes !== undefined) strokesByCharacter[character] = match.kanji.strokes;
    });

    const status = computeSlotStatus(payload.slots, expectedCharacters, strokesByCharacter);

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
