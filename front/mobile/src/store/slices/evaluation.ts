import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { KANJI_PROGRESSION_INC, KANJI_PROGRESSION_INC_LOW } from '../../constants/progression';
import { fileNames, fileServiceInstance } from '../../services/file';
import { core } from '../../services/http';

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
  /** Session persisted server-side so the run can be resumed after the app is killed */
  sessionId: string | null;
  checkActiveSessionStatus: RequestStatusType;
};

const initialState: EvaluationState = {
  items: [],
  currentIndex: 0,
  status: 'idle',
  sessionId: null,
  checkActiveSessionStatus: 'idle',
};

/** Status actually shown to the user: on a 'review' answer, their own verdict wins */
export function getEffectiveStatus(item: EvaluationItemType): AnswerStatusType {
  if (item.status !== 'review' || item.userConfirmation === null) return item.status;

  return item.userConfirmation ? 'correct' : 'incorrect';
}

/** Progression deltas for a finished (or abandoned) run, recomputed from the items themselves
 * rather than dispatched live per-answer — items are what survives an app kill, in-memory Redux
 * state isn't, so this is what makes progression resilient to a resumed session */
export function computeProgressionDeltas(items: EvaluationItemType[]): { id: string; inc: number }[] {
  const deltas: { id: string; inc: number }[] = [];

  items.forEach((item) => {
    const kanjiId = item.kanji.kanji_id;
    if (!kanjiId) return;

    if (item.status === 'correct') {
      deltas.push({ id: kanjiId, inc: KANJI_PROGRESSION_INC });
    } else if (item.status === 'incorrect') {
      // A skip (no drawing at all) carries no penalty, unlike a wrong stroke count
      const isSkip = !item.image || item.strokesCount === 0;
      if (!isSkip) deltas.push({ id: kanjiId, inc: -KANJI_PROGRESSION_INC });
    } else if (item.status === 'review' && item.userConfirmation !== null) {
      deltas.push({ id: kanjiId, inc: item.userConfirmation ? KANJI_PROGRESSION_INC_LOW : -KANJI_PROGRESSION_INC });
    }
  });

  return deltas;
}

export function toKanjiQuestion(item: EvaluationItemType): KanjiSessionQuestion {
  return {
    kanjiId: item.kanji.kanji_id ?? '',
    image: item.image,
    strokesCount: item.strokesCount,
    status: item.status,
    userConfirmation: item.userConfirmation,
  };
}

/** Local mirror of the run in progress: the only thing that lets a kanji session resume
 * without any network access, and what a run started offline is made of until it can sync */
export type PendingLocalSession = {
  items: EvaluationItemType[];
  currentIndex: number;
  sessionId: string | null;
};

export const persistLocalSession = (session: PendingLocalSession) =>
  fileServiceInstance.write(fileNames.PENDING_KANJI_SESSION, session).catch(() => undefined);

export const clearLocalSession = () => fileServiceInstance.remove(fileNames.PENDING_KANJI_SESSION).catch(() => undefined);

export const checkActiveSession = createAsyncThunk('evaluation/checkActiveSession', async (_: void, { getState }) => {
  const userId = (getState() as RootState).user.userId;
  // No identity yet (e.g. getUser hasn't resolved): nothing to resume, degrade to local-only
  if (!userId) return null;

  const response = await core.sessionsService!.findActive(userId, 'kanji');

  return response.data;
});

export const startFreshSession = createAsyncThunk(
  'evaluation/startFreshSession',
  async (payload: { kanjis: Partial<KanjiType>[]; abandonSessionId?: string }, { getState }) => {
    const userId = (getState() as RootState).user.userId;
    let sessionId: string | null = null;

    const items: EvaluationItemType[] = payload.kanjis.map((kanji) => ({
      kanji,
      score: null,
      status: 'idle' as AnswerStatusType,
      image: null,
      strokesCount: 0,
      userConfirmation: null,
    }));

    // Offline, unreachable server, or no identity yet: the run still starts, just local-only —
    // it becomes a real session later, at finish time, if a connection is available by then
    if (userId) {
      try {
        if (payload.abandonSessionId) {
          await core.sessionsService!.abandon(payload.abandonSessionId).catch(() => undefined);
        }

        const response = await core.sessionsService!.create({
          userId,
          type: 'kanji',
          questions: items.map(toKanjiQuestion),
        });
        sessionId = response.data.sessionId;
      } catch {
        sessionId = null;
      }
    }

    await persistLocalSession({ items, currentIndex: 0, sessionId });

    return { items, sessionId };
  },
);

export const getPendingEvaluation = createAsyncThunk('evaluation/getEvaluation', async () => {
  // const response = await core.get('/evaluation/pending');
  // return response.data;
});

export const getHistory = createAsyncThunk('evaluation/getHistory', async () => {
  // const response = await core.get('/evaluation/history');
  // return response.data;
});

export const saveEvaluation = createAsyncThunk('evaluation/saveEvaluation', async (evaluation) => {
  // const response = await core.post('/evaluation', evaluation);
  // return response.data;
});

export const updateItemScore = createAsyncThunk(
  'evaluation/updateItem',
  async (payload: { result: PredictionType[]; strokesCount: number; image: string | null }, { getState }) => {
    const state = getState() as RootState;
    const currentIndex = state.evaluation.currentIndex;
    const currentItem = state.evaluation.items[currentIndex];
    const expected = currentItem.kanji.kanji;
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

    // Best-effort: a network hiccup here shouldn't block scoring a drawing the user already made.
    // The local mirror below is what actually guarantees resume, not this.
    if (state.evaluation.sessionId && currentItem.kanji.kanji_id) {
      core
        .sessionsService!.updateQuestion(state.evaluation.sessionId, {
          kanjiId: currentItem.kanji.kanji_id,
          image: payload.image,
          strokesCount: payload.strokesCount,
          status,
          userConfirmation: null,
        })
        .catch(() => undefined);
    }

    const nextItems = [...state.evaluation.items];
    nextItems[currentIndex] = { ...currentItem, ...body };
    await persistLocalSession({ items: nextItems, currentIndex: currentIndex + 1, sessionId: state.evaluation.sessionId });

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
    hydrateItems: (
      state,
      action: PayloadAction<{ items: EvaluationItemType[]; currentIndex: number; sessionId: string | null }>,
    ) => {
      state.items = action.payload.items;
      state.currentIndex = action.payload.currentIndex;
      state.sessionId = action.payload.sessionId;
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkActiveSession.pending, (state) => {
        state.checkActiveSessionStatus = 'pending';
      })
      .addCase(checkActiveSession.fulfilled, (state) => {
        state.checkActiveSessionStatus = 'succeeded';
      })
      .addCase(checkActiveSession.rejected, (state) => {
        state.checkActiveSessionStatus = 'failed';
      })
      .addCase(startFreshSession.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(startFreshSession.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.currentIndex = 0;
        state.sessionId = action.payload.sessionId;
        state.status = 'succeeded';
      })
      .addCase(startFreshSession.rejected, (state) => {
        state.status = 'failed';
        state.currentIndex = 0;
        state.items = [];
      })
      .addCase(getPendingEvaluation.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(getPendingEvaluation.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(getPendingEvaluation.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(getHistory.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(getHistory.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(getHistory.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(saveEvaluation.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(saveEvaluation.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(saveEvaluation.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(updateItemScore.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(updateItemScore.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items[state.currentIndex] = { ...state.items[state.currentIndex], ...action.payload };
        state.currentIndex++;
      })
      .addCase(updateItemScore.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { confirmItem, reset, hydrateItems } = evaluationSlice.actions;
export default evaluationSlice.reducer;

export const selectEvaluationItems = (state: RootState) => state.evaluation.items;
export const selectEvaluationStatus = (state: RootState) => state.evaluation.status;
export const selectCurrentIndex = (state: RootState) => state.evaluation.currentIndex;
export const selectEvaluationSessionId = (state: RootState) => state.evaluation.sessionId;
export const selectCheckActiveSessionStatus = (state: RootState) => state.evaluation.checkActiveSessionStatus;
/** Answers still waiting for the user to arbitrate: blocks the result validation */
export const selectPendingReviewCount = (state: RootState) =>
  state.evaluation.items.filter((item) => item.status === 'review' && item.userConfirmation === null).length;
export const selectCorrectCount = (state: RootState) =>
  state.evaluation.items.filter((item) => getEffectiveStatus(item) === 'correct').length;
