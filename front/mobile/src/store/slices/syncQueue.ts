import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'store';

import { fileNames, fileServiceInstance } from '../../services/file';
import { core } from '../../services/http';

export type SyncQueueItem =
  | { id: string; type: 'syncProgression' }
  | { id: string; type: 'finishSession'; sessionId: string; score: number }
  | {
      id: string;
      type: 'createAndFinishSession';
      userId: string;
      kind: SessionKind;
      questions: SessionType['questions'];
      score: number;
    };

type SyncQueueState = {
  items: SyncQueueItem[];
  initStatus: RequestStatusType;
};

const initialState: SyncQueueState = {
  items: [],
  initStatus: 'idle',
};

// No backend involved (this queue exists precisely for when there is none) — same id shape as
// generateListId, kept local to avoid importing a list-specific-sounding helper for an unrelated
// queue item
export function generateQueueItemId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function persist(items: SyncQueueItem[]) {
  await fileServiceInstance.write(fileNames.SYNC_QUEUE, items);
}

export const initialize = createAsyncThunk<SyncQueueItem[]>('syncQueue/init', async () => {
  const content = await fileServiceInstance.read(fileNames.SYNC_QUEUE);
  return content ?? [];
});

// One 'syncProgression' item covers every unsynced change: a retry always re-reads the CURRENT
// progression (see flush below), never a snapshot taken when the item was queued — so queuing a
// second one after another offline session would be redundant, not more correct, and could only
// ever go stale relative to the first.
export const enqueueProgressionSync = createAsyncThunk<SyncQueueItem[], void>(
  'syncQueue/enqueueProgressionSync',
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (state.syncQueue.items.some((item) => item.type === 'syncProgression')) return state.syncQueue.items;

    const items: SyncQueueItem[] = [...state.syncQueue.items, { id: generateQueueItemId(), type: 'syncProgression' }];
    await persist(items);
    return items;
  },
);

export const enqueueSessionFinish = createAsyncThunk<
  SyncQueueItem[],
  { sessionId: string; score: number } | { userId: string; kind: SessionKind; questions: SessionType['questions']; score: number }
>('syncQueue/enqueueSessionFinish', async (payload, { getState }) => {
  const state = getState() as RootState;
  const item: SyncQueueItem =
    'sessionId' in payload
      ? { id: generateQueueItemId(), type: 'finishSession', sessionId: payload.sessionId, score: payload.score }
      : {
          id: generateQueueItemId(),
          type: 'createAndFinishSession',
          userId: payload.userId,
          kind: payload.kind,
          questions: payload.questions,
          score: payload.score,
        };

  const items = [...state.syncQueue.items, item];
  await persist(items);
  return items;
});

// Attempts every queued item once, sequentially (not in parallel — right after a reconnect isn't
// the moment to burst several requests at once). Whatever fails stays queued for the next flush,
// whether that's triggered by the next reconnect or the next app launch.
export const flush = createAsyncThunk<SyncQueueItem[]>('syncQueue/flush', async (_, { getState }) => {
  const items = (getState() as RootState).syncQueue.items;
  const remaining: SyncQueueItem[] = [];

  for (const item of items) {
    try {
      if (item.type === 'syncProgression') {
        const { userId, totalScore, dailyScores, progression, wordProgression } = (getState() as RootState).user;
        if (!userId) throw new Error('No user id yet');
        await core.authService!.updateKanjiProgression(userId, { totalScore, dailyScores, progression, wordProgression });
      } else if (item.type === 'finishSession') {
        await core.sessionsService!.finish(item.sessionId, item.score);
      } else {
        const response = await core.sessionsService!.create({ userId: item.userId, type: item.kind, questions: item.questions });
        await core.sessionsService!.finish(response.data.sessionId, item.score);
      }
    } catch {
      remaining.push(item);
    }
  }

  await persist(remaining);
  return remaining;
});

const syncQueueSlice = createSlice({
  name: 'syncQueue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initialize.pending, (state) => {
        state.initStatus = 'pending';
      })
      .addCase(initialize.fulfilled, (state, action) => {
        state.items = action.payload;
        state.initStatus = 'succeeded';
      })
      .addCase(initialize.rejected, (state) => {
        state.initStatus = 'failed';
      })
      .addCase(enqueueProgressionSync.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(enqueueSessionFinish.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(flush.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default syncQueueSlice.reducer;

export const selectSyncQueueItems = (state: RootState) => state.syncQueue.items;
export const selectHasPendingProgressionSync = (state: RootState) =>
  state.syncQueue.items.some((item) => item.type === 'syncProgression');
