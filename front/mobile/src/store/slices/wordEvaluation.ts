import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { fileNames, fileServiceInstance } from '../../services/file';
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
  // Session persisted server-side so the run can be resumed after the app is killed — same
  // reasoning as the kanji evaluation slice's own sessionId
  sessionId: string | null;
};

const initialState: WordEvaluationState = {
  items: [],
  currentIndex: 0,
  status: 'idle',
  sessionId: null,
};

/** Local mirror of the run in progress — what a run started offline is made of until it can
 * sync, and what lets a killed app resume without any network access at all */
export type PendingLocalWordSession = {
  items: WordEvaluationItemType[];
  currentIndex: number;
  sessionId: string | null;
};

export const persistLocalSession = (session: PendingLocalWordSession) =>
  fileServiceInstance.write(fileNames.PENDING_WORD_SESSION, session).catch(() => undefined);

export const clearLocalSession = () => fileServiceInstance.remove(fileNames.PENDING_WORD_SESSION).catch(() => undefined);

export function toWordQuestion(item: WordEvaluationItemType): WordSessionQuestion {
  return {
    wordId: item.word.word_id ?? '',
    slots: item.slots,
    status: item.status,
    userConfirmation: item.userConfirmation,
  };
}

export function getEffectiveStatus(item: WordEvaluationItemType): AnswerStatusType {
  if (item.status !== 'review' || item.userConfirmation === null) return item.status;

  return item.userConfirmation ? 'correct' : 'incorrect';
}

export const KANJI_REGEX = /[一-鿿㐀-䶿]/;

// The iteration mark (々) isn't a kanji itself — it stands in for a repeat of whichever kanji
// came right before it (e.g. 々 in 前々 means "前 again"), so it resolves to that character
// rather than being dropped, which would silently skip a drawing slot for it.
const ITERATION_MARK = '々';

export function getKanjiCharacters(word: string): string[] {
  const characters: string[] = [];

  Array.from(word).forEach((character) => {
    if (character === ITERATION_MARK) {
      const previous = characters[characters.length - 1];
      if (previous) characters.push(previous);
      return;
    }

    if (KANJI_REGEX.test(character)) characters.push(character);
  });

  return characters;
}

// Word mode practices drawing a word's kanji — a kana-only word has nothing to draw, so it's
// never a valid practice item there
export function filterWordsWithKanji(words: WordType[]): WordType[] {
  return words.filter((word) => getKanjiCharacters(word.word[0] ?? '').length > 0);
}

function resolveKanjiAt(characters: string[], index: number): string | null {
  const character = characters[index];
  if (character === ITERATION_MARK) {
    return index > 0 ? resolveKanjiAt(characters, index - 1) : null;
  }
  return KANJI_REGEX.test(character) ? character : null;
}

// A word can have several valid spellings (e.g. 辞書/辭書 for the same じしょ) — the drawing
// exercise is built from the primary one, but a variant kanji at the same position is just as
// correct an answer. Only spellings the same length as the primary one are usable here: a
// different length can't be aligned position-by-position against the drawing slots at all.
export function getExpectedCharacterOptions(word: Partial<WordType>): string[][] {
  const spellings = word.word ?? [];
  const primaryCharacters = Array.from(spellings[0] ?? '');
  const alternateCharacters = spellings
    .slice(1)
    .map((spelling) => Array.from(spelling))
    .filter((characters) => characters.length === primaryCharacters.length);

  const options: string[][] = [];
  primaryCharacters.forEach((_, index) => {
    const primaryCharacter = resolveKanjiAt(primaryCharacters, index);
    if (primaryCharacter === null) return;

    const slotOptions = new Set<string>([primaryCharacter]);
    alternateCharacters.forEach((characters) => {
      const alternateCharacter = resolveKanjiAt(characters, index);
      if (alternateCharacter !== null) slotOptions.add(alternateCharacter);
    });

    options.push(Array.from(slotOptions));
  });

  return options;
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

function shuffle<T>(items: T[]): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

// Picks `count` words, shuffled. A list shorter than `count` is cycled (shuffled each lap) so a
// small word list still fills a full session, at the cost of repeats.
export function sampleWords(words: WordType[], count: number): WordType[] {
  if (words.length === 0) return [];

  const result: WordType[] = [];
  while (result.length < count) {
    result.push(...shuffle(words));
  }
  return result.slice(0, count);
}

// No connection to check with, or no identity yet: nothing to resume, degrade to local-only —
// offline, this would otherwise wait out a full request timeout just to fail the same way
export const checkActiveSession = createAsyncThunk(
  'wordEvaluation/checkActiveSession',
  async (isOffline: boolean, { getState }) => {
    const userId = (getState() as RootState).user.userId;
    if (!userId || isOffline) return null;

    const response = await core.sessionsService!.findActive(userId, 'word');

    return response.data;
  },
);

// Kanji mode: generates a practice set from the active kanji list's characters via the backend.
// Word mode: the user already hand-picked these words — no generation needed, just resolve them
// (assumes state.word.entities is already populated by the caller) and cap the session length
// the same way kanji mode does. Either way, also opens the server-side session the run will
// report progress against — offline, unreachable server, or no identity: the run still starts,
// just local-only, and becomes a real session later at finish time if a connection is available.
export const init = createAsyncThunk(
  'wordEvaluation/init',
  async (
    payload: { kind?: WordEvaluationKind; number?: number; isOffline?: boolean; abandonSessionId?: string } | undefined,
    { getState },
  ) => {
    const state = getState() as RootState;
    const number = payload?.number ?? 10;
    const kind = payload?.kind ?? 'kanji';
    const userId = state.user.userId;

    let words: WordType[];
    if (kind === 'word') {
      const activeList = state.wordLists.activeListId ? state.wordLists.lists[state.wordLists.activeListId] : undefined;
      const listWords = (activeList?.wordIds ?? [])
        .map((id) => state.word.entities[id])
        .filter((word): word is WordType => !!word);

      words = sampleWords(filterWordsWithKanji(listWords), number);
    } else {
      const activeList = state.lists.activeListId ? state.lists.lists[state.lists.activeListId] : undefined;
      const characters = (activeList?.kanjiIds ?? [])
        .map((id) => state.kanji.entities[id]?.kanji?.character)
        .filter((character): character is string => !!character);

      const response = await core.wordService!.getPracticeWords(characters, number);
      words = response.data;
    }

    const items: WordEvaluationItemType[] = words.map((word) => ({
      word,
      slots: [],
      status: 'idle' as AnswerStatusType,
      userConfirmation: null,
    }));

    let sessionId: string | null = null;
    if (userId && !payload?.isOffline) {
      try {
        if (payload?.abandonSessionId) {
          await core.sessionsService!.abandon(payload.abandonSessionId).catch(() => undefined);
        }

        const response = await core.sessionsService!.create({ userId, type: 'word', questions: items.map(toWordQuestion) });
        sessionId = response.data.sessionId;
      } catch {
        sessionId = null;
      }
    }

    await persistLocalSession({ items, currentIndex: 0, sessionId });

    return { items, sessionId };
  },
);

// Pure so it's testable without mocking Redux state — the thunk below only assembles
// strokesByCharacter from state, this decides the actual verdict from that plus the drawing.
// Each slot can have more than one accepted character (see getExpectedCharacterOptions) — a
// drawing matches if it matches ANY option at its position, stroke count included, since variant
// spellings can genuinely have different stroke counts for the same position.
export function computeSlotStatus(
  slots: WordSlotType[],
  expectedCharacterOptions: string[][],
  strokesByCharacter: Record<string, number>,
): AnswerStatusType {
  const hasEmptySlot = slots.some((slot) => !slot.image || slot.strokesCount === 0);

  const hasWrongStrokeCount = slots.some((slot, index) => {
    const options = expectedCharacterOptions[index] ?? [];
    const knownStrokeCounts = options
      .map((character) => strokesByCharacter[character])
      .filter((count): count is number => count !== undefined);

    // No known expected count for any accepted character here: can't rule the drawing out on
    // this basis, same as the single-option case before
    if (knownStrokeCounts.length === 0) return false;
    return !knownStrokeCounts.includes(slot.strokesCount);
  });

  if (slots.length !== expectedCharacterOptions.length || hasEmptySlot || hasWrongStrokeCount) return 'incorrect';

  const isFullyCorrect = slots.every((slot, index) => {
    const options = expectedCharacterOptions[index] ?? [];
    return slot.predictions.some((prediction) => options.includes(prediction.label));
  });

  return isFullyCorrect ? 'correct' : 'review';
}

export const updateItemSlots = createAsyncThunk(
  'wordEvaluation/updateItemSlots',
  async (payload: { slots: WordSlotType[] }, { getState }) => {
    const state = getState() as RootState;
    const currentIndex = state.wordEvaluation.currentIndex;
    const currentItem = state.wordEvaluation.items[currentIndex];
    const expectedCharacterOptions = getExpectedCharacterOptions(currentItem.word);

    // Resolved per character actually accepted for the word being practiced (every spelling
    // variant, not just the primary one), via the kanji search cache — not from any active list.
    // A practiced word can (and often does) contain kanji outside whichever list seeded or
    // selected it, kanji-mode included.
    const strokesByCharacter: Record<string, number> = {};
    expectedCharacterOptions.flat().forEach((character) => {
      const match = state.kanji.search[character]?.results.find((entry) => entry.kanji?.character === character);
      if (match?.kanji?.strokes !== undefined) strokesByCharacter[character] = match.kanji.strokes;
    });

    const status = computeSlotStatus(payload.slots, expectedCharacterOptions, strokesByCharacter);

    // Best-effort: a network hiccup here shouldn't block scoring a drawing the user already made.
    // The local mirror below is what actually guarantees resume, not this — same split as the
    // kanji evaluation slice's own updateItemScore.
    if (state.wordEvaluation.sessionId && currentItem.word.word_id) {
      core
        .sessionsService!.updateQuestion(state.wordEvaluation.sessionId, {
          wordId: currentItem.word.word_id,
          slots: payload.slots,
          status,
          userConfirmation: null,
        })
        .catch(() => undefined);
    }

    const nextItems = [...state.wordEvaluation.items];
    nextItems[currentIndex] = { ...currentItem, slots: payload.slots, status };
    await persistLocalSession({ items: nextItems, currentIndex: currentIndex + 1, sessionId: state.wordEvaluation.sessionId });

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
    // Resolves a pending session (local or server) into live state — the only way back into a
    // run that was suspended, mirroring the kanji evaluation slice's own hydrateItems
    hydrateItems: (
      state,
      action: PayloadAction<{ items: WordEvaluationItemType[]; currentIndex: number; sessionId: string | null }>,
    ) => {
      state.items = action.payload.items;
      state.currentIndex = action.payload.currentIndex;
      state.sessionId = action.payload.sessionId;
      state.status = 'succeeded';
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(init.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(init.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.sessionId = action.payload.sessionId;
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

export const { confirmItem, hydrateItems, reset } = wordEvaluationSlice.actions;
export default wordEvaluationSlice.reducer;

export const selectWordEvaluationItems = (state: RootState) => state.wordEvaluation.items;
export const selectWordCurrentIndex = (state: RootState) => state.wordEvaluation.currentIndex;
export const selectWordEvaluationStatus = (state: RootState) => state.wordEvaluation.status;
export const selectWordEvaluationSessionId = (state: RootState) => state.wordEvaluation.sessionId;
export const selectWordPendingReviewCount = (state: RootState) =>
  state.wordEvaluation.items.filter((item) => item.status === 'review' && item.userConfirmation === null).length;
export const selectWordCorrectCount = (state: RootState) =>
  state.wordEvaluation.items.filter((item) => getEffectiveStatus(item) === 'correct').length;
