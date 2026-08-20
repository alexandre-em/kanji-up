import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { applyReview, createInitialCardProgress, FlashcardCardProgress, isCardDue } from '../../constants/flashcards';
import { FLASHCARD_PROGRESS_KEY, WORD_FLASHCARD_PROGRESS_KEY } from '../../constants/storage';
import { fileServiceInstance } from '../../services/file';
import { RootState } from '..';

type FlashcardsState = {
  // Keyed by kanji_id, matching how selectedKanji itself is keyed
  progress: Record<string, FlashcardCardProgress>;
  // Same shape, keyed by word_id instead — kept as a sibling field rather than a separate slice so
  // the Leitner scheduling logic (constants/flashcards.ts) isn't duplicated for the two entity kinds
  wordProgress: Record<string, FlashcardCardProgress>;
  initStatus: RequestStatusType;
};

const initialState: FlashcardsState = {
  progress: {},
  wordProgress: {},
  initStatus: 'idle',
};

export const initialize = createAsyncThunk<{
  progress: Record<string, FlashcardCardProgress>;
  wordProgress: Record<string, FlashcardCardProgress>;
}>('flashcards/init', async () => {
  const [progress, wordProgress] = await Promise.all([
    fileServiceInstance.read(FLASHCARD_PROGRESS_KEY),
    fileServiceInstance.read(WORD_FLASHCARD_PROGRESS_KEY),
  ]);
  return { progress: progress ?? {}, wordProgress: wordProgress ?? {} };
});

// Persists immediately on every review — the dataset is small (one entry per selected kanji), so
// there's no need for the staged add/remove + explicit save step selectedKanji uses
export const reviewCard = createAsyncThunk<
  { kanjiId: string; progress: FlashcardCardProgress },
  { kanjiId: string; knew: boolean }
>('flashcards/reviewCard', async ({ kanjiId, knew }, { getState }) => {
  const state = getState() as RootState;
  const current = state.flashcards.progress[kanjiId] ?? createInitialCardProgress();
  const progress = applyReview(current, knew);

  const updated = { ...state.flashcards.progress, [kanjiId]: progress };
  await fileServiceInstance.write(FLASHCARD_PROGRESS_KEY, updated);

  return { kanjiId, progress };
});

export const reviewWordCard = createAsyncThunk<
  { wordId: string; progress: FlashcardCardProgress },
  { wordId: string; knew: boolean }
>('flashcards/reviewWordCard', async ({ wordId, knew }, { getState }) => {
  const state = getState() as RootState;
  const current = state.flashcards.wordProgress[wordId] ?? createInitialCardProgress();
  const progress = applyReview(current, knew);

  const updated = { ...state.flashcards.wordProgress, [wordId]: progress };
  await fileServiceInstance.write(WORD_FLASHCARD_PROGRESS_KEY, updated);

  return { wordId, progress };
});

export const flashcards = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.initStatus = 'pending';
    });
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.progress = action.payload.progress;
      state.wordProgress = action.payload.wordProgress;
      state.initStatus = 'succeeded';
    });
    builder.addCase(initialize.rejected, (state) => {
      state.initStatus = 'failed';
    });
    builder.addCase(reviewCard.fulfilled, (state, action) => {
      state.progress[action.payload.kanjiId] = action.payload.progress;
    });
    builder.addCase(reviewWordCard.fulfilled, (state, action) => {
      state.wordProgress[action.payload.wordId] = action.payload.progress;
    });
  },
});

export default flashcards.reducer;

export const selectFlashcardInitStatus = (state: RootState) => state.flashcards.initStatus;
export const selectFlashcardProgress = (state: RootState) => state.flashcards.progress;
export const selectWordFlashcardProgress = (state: RootState) => state.flashcards.wordProgress;

// The active list's kanji, filtered down to what's actually due for review right now — never-
// reviewed kanji count as due, same as a fresh Leitner card. Only resolves ids already cached in
// the kanji slice — the screen is responsible for fetching any missing ones first.
export const selectDueFlashcards = (state: RootState): Partial<KanjiType>[] => {
  const activeList = state.lists.activeListId ? state.lists.lists[state.lists.activeListId] : undefined;
  if (!activeList) return [];

  return activeList.kanjiIds
    .map((id) => state.kanji.entities[id])
    .filter((kanji): kanji is KanjiType => !!kanji)
    .filter((kanji) => isCardDue(state.flashcards.progress[kanji.kanji_id!]));
};

// Same as selectDueFlashcards, scoped to the active word list instead
export const selectDueWordFlashcards = (state: RootState): Partial<WordType>[] => {
  const activeList = state.wordLists.activeListId ? state.wordLists.lists[state.wordLists.activeListId] : undefined;
  if (!activeList) return [];

  return activeList.wordIds
    .map((id) => state.word.entities[id])
    .filter((word): word is WordType => !!word)
    .filter((word) => isCardDue(state.flashcards.wordProgress[word.word_id!]));
};
