import { RootState } from '..';
import syncQueueReducer, {
  enqueueProgressionSync,
  enqueueSessionFinish,
  flush,
  selectHasPendingProgressionSync,
  SyncQueueItem,
} from './syncQueue';

const baseState: RootState['syncQueue'] = { items: [], initStatus: 'succeeded' };

const asRootState = (syncQueueState: RootState['syncQueue'], userState?: Partial<RootState['user']>) =>
  ({ syncQueue: syncQueueState, user: userState ?? {} }) as RootState;

describe('enqueueProgressionSync', () => {
  it('adds a progression-sync item when none is queued yet', async () => {
    const action = await enqueueProgressionSync()(
      () => undefined,
      () => asRootState(baseState),
      undefined,
    );

    expect(action.type).toBe('syncQueue/enqueueProgressionSync/fulfilled');
    const items = (action as { payload: SyncQueueItem[] }).payload;
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('syncProgression');
  });

  it('does not add a second progression-sync item when one is already queued', async () => {
    const existing: RootState['syncQueue'] = {
      items: [{ id: 'existing', type: 'syncProgression' }],
      initStatus: 'succeeded',
    };

    const action = await enqueueProgressionSync()(
      () => undefined,
      () => asRootState(existing),
      undefined,
    );

    const items = (action as { payload: SyncQueueItem[] }).payload;
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('existing');
  });
});

describe('enqueueSessionFinish', () => {
  it('queues a finishSession item for an already-created session', async () => {
    const action = await enqueueSessionFinish({ sessionId: 's1', score: 8 })(
      () => undefined,
      () => asRootState(baseState),
      undefined,
    );

    const items = (action as { payload: SyncQueueItem[] }).payload;
    expect(items).toEqual([expect.objectContaining({ type: 'finishSession', sessionId: 's1', score: 8 })]);
  });

  it('queues a createAndFinishSession item for a session that was never created server-side', async () => {
    const action = await enqueueSessionFinish({ userId: 'u1', kind: 'kanji', questions: [], score: 5 })(
      () => undefined,
      () => asRootState(baseState),
      undefined,
    );

    const items = (action as { payload: SyncQueueItem[] }).payload;
    expect(items).toEqual([expect.objectContaining({ type: 'createAndFinishSession', userId: 'u1', kind: 'kanji', score: 5 })]);
  });
});

describe('reducer', () => {
  it('replaces items on enqueueProgressionSync.fulfilled', () => {
    const items: SyncQueueItem[] = [{ id: '1', type: 'syncProgression' }];
    const result = syncQueueReducer(baseState, enqueueProgressionSync.fulfilled(items, '', undefined));

    expect(result.items).toEqual(items);
  });

  it('replaces items on flush.fulfilled with whatever remained', () => {
    const remaining: SyncQueueItem[] = [{ id: '1', type: 'finishSession', sessionId: 's1', score: 3 }];
    const result = syncQueueReducer(baseState, flush.fulfilled(remaining, '', undefined));

    expect(result.items).toEqual(remaining);
  });
});

describe('selectHasPendingProgressionSync', () => {
  it('is false when the queue is empty', () => {
    expect(selectHasPendingProgressionSync(asRootState(baseState))).toBe(false);
  });

  it('is true when a syncProgression item is queued', () => {
    const state: RootState['syncQueue'] = { items: [{ id: '1', type: 'syncProgression' }], initStatus: 'succeeded' };

    expect(selectHasPendingProgressionSync(asRootState(state))).toBe(true);
  });

  it('is false when only session-finish items are queued', () => {
    const state: RootState['syncQueue'] = {
      items: [{ id: '1', type: 'finishSession', sessionId: 's1', score: 1 }],
      initStatus: 'succeeded',
    };

    expect(selectHasPendingProgressionSync(asRootState(state))).toBe(false);
  });
});
