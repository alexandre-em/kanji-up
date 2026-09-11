import reducer, { getAll } from './kanji';

const baseState = {
  entities: {},
  kanjis: [{ kanji_id: 'a' }],
  random: undefined,
  search: {},
  last: { page: 1, type: 'jlpt' as const, difficulty: 'N5', totalPage: 2 },
  getOneStatus: 'idle' as const,
  getAllStatus: 'idle' as const,
  getRandomStatus: 'idle' as const,
  searchStatus: 'idle' as const,
};

describe('kanji reducer — getAll.pending', () => {
  it('clears the stale list when switching to a different difficulty', () => {
    const action = getAll.pending('req-id', { type: 'jlpt', difficulty: 'N4' });

    const result = reducer(baseState as never, action);

    expect(result.kanjis).toEqual([]);
  });

  it('clears the stale list when switching type even if the difficulty string matches', () => {
    const action = getAll.pending('req-id', { type: 'grade', difficulty: 'N5' });

    const result = reducer(baseState as never, action);

    expect(result.kanjis).toEqual([]);
  });

  it('keeps the existing list when paginating the same difficulty', () => {
    const action = getAll.pending('req-id', { type: 'jlpt', difficulty: 'N5', page: 2 });

    const result = reducer(baseState as never, action);

    expect(result.kanjis).toEqual([{ kanji_id: 'a' }]);
  });
});
