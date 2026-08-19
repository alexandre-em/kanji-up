import sessionHistoryReducer, { fetchSessionHistory, PAGE_SIZE } from './sessionHistory';

const baseState = {
  itemsByType: { kanji: [], word: [], other: [] },
  hasMoreByType: { kanji: true, word: true, other: true },
  pageByType: { kanji: 1, word: 1, other: 1 },
  status: 'idle' as const,
};

const session = (sessionId: string): SessionType =>
  ({
    sessionId,
    userId: 'u1',
    type: 'kanji',
    status: 'finished',
    questions: [],
    currentIndex: 0,
    score: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }) as SessionType;

const fulfilled = (type: SessionKind, results: SessionType[], page: number) =>
  fetchSessionHistory.fulfilled({ type, results, page }, 'requestId', { userId: 'u1', type });

describe('fetchSessionHistory.fulfilled', () => {
  it('sets the list on the first page', () => {
    const results = [session('s1'), session('s2')];

    const result = sessionHistoryReducer(baseState, fulfilled('kanji', results, 1));

    expect(result.itemsByType.kanji).toEqual(results);
  });

  it('appends (not replaces) on a later page', () => {
    const stateWithFirstPage = { ...baseState, itemsByType: { ...baseState.itemsByType, kanji: [session('s1')] } };

    const result = sessionHistoryReducer(stateWithFirstPage, fulfilled('kanji', [session('s2')], 2));

    expect(result.itemsByType.kanji).toEqual([session('s1'), session('s2')]);
  });

  it('replaces (not appends) if re-fetching page 1 after already having later pages', () => {
    const stateWithTwoPages = {
      ...baseState,
      itemsByType: { ...baseState.itemsByType, kanji: [session('s1'), session('s2')] },
    };

    const result = sessionHistoryReducer(stateWithTwoPages, fulfilled('kanji', [session('s3')], 1));

    expect(result.itemsByType.kanji).toEqual([session('s3')]);
  });

  it('advances the next page number', () => {
    const result = sessionHistoryReducer(baseState, fulfilled('kanji', [session('s1')], 1));

    expect(result.pageByType.kanji).toBe(2);
  });

  it('sets hasMore to true when a full page comes back', () => {
    const fullPage = Array.from({ length: PAGE_SIZE }, (_, i) => session(`s${i}`));

    const result = sessionHistoryReducer(baseState, fulfilled('kanji', fullPage, 1));

    expect(result.hasMoreByType.kanji).toBe(true);
  });

  it('sets hasMore to false when a short page comes back', () => {
    const shortPage = [session('s1')];

    const result = sessionHistoryReducer(baseState, fulfilled('kanji', shortPage, 1));

    expect(result.hasMoreByType.kanji).toBe(false);
  });

  it('only touches the fetched type, leaving other types untouched', () => {
    const result = sessionHistoryReducer(baseState, fulfilled('kanji', [session('s1')], 1));

    expect(result.itemsByType.word).toEqual([]);
    expect(result.hasMoreByType.word).toBe(true);
    expect(result.pageByType.word).toBe(1);
  });
});

describe('fetchSessionHistory.pending / rejected', () => {
  it('sets status to pending', () => {
    const result = sessionHistoryReducer(baseState, fetchSessionHistory.pending('requestId', { userId: 'u1', type: 'kanji' }));

    expect(result.status).toBe('pending');
  });

  it('sets status to failed without touching cached items', () => {
    const stateWithItems = { ...baseState, itemsByType: { ...baseState.itemsByType, kanji: [session('s1')] } };

    const result = sessionHistoryReducer(
      stateWithItems,
      fetchSessionHistory.rejected(new Error('network'), 'requestId', { userId: 'u1', type: 'kanji' }),
    );

    expect(result.status).toBe('failed');
    expect(result.itemsByType.kanji).toEqual([session('s1')]);
  });
});
