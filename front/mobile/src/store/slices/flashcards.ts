import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { applyReview, createInitialCardProgress, FlashcardCardProgress, isCardDue } from '../../constants/flashcards';
import { FLASHCARD_PROGRESS_KEY } from '../../constants/storage';
import { fileServiceInstance } from '../../services/file';
import { RootState } from '..';

type FlashcardsState = {
  // Keyed by kanji_id, matching how selectedKanji itself is keyed
  progress: Record<string, FlashcardCardProgress>;
  initStatus: RequestStatusType;
};

const initialState: FlashcardsState = {
  progress: {},
  initStatus: 'idle',
};

export const initialize = createAsyncThunk<Record<string, FlashcardCardProgress>>('flashcards/init', async () => {
  const content = await fileServiceInstance.read(FLASHCARD_PROGRESS_KEY);
  return content ?? {};
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

export const flashcards = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.initStatus = 'pending';
    });
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.progress = action.payload;
      state.initStatus = 'succeeded';
    });
    builder.addCase(initialize.rejected, (state) => {
      state.initStatus = 'failed';
    });
    builder.addCase(reviewCard.fulfilled, (state, action) => {
      state.progress[action.payload.kanjiId] = action.payload.progress;
    });
  },
});

export default flashcards.reducer;

export const selectFlashcardInitStatus = (state: RootState) => state.flashcards.initStatus;
export const selectFlashcardProgress = (state: RootState) => state.flashcards.progress;

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
