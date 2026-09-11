import { buildGetAllParams, mergeKanjiPage } from './useKanjiListPage';

const kanji = (id: string): KanjiType => ({ kanji_id: id }) as unknown as KanjiType;

describe('buildGetAllParams', () => {
  it('maps jlpt to a jlpt query param', () => {
    expect(buildGetAllParams('jlpt', 'N5', 1)).toEqual({ page: 1, limit: 50, jlpt: 'N5' });
  });

  it('maps grade to a grade query param', () => {
    expect(buildGetAllParams('grade', '3', 2)).toEqual({ page: 2, limit: 50, grade: '3' });
  });

  it('maps advanced to a boolean flag, ignoring the difficulty placeholder', () => {
    expect(buildGetAllParams('advanced', 'unused', 1)).toEqual({ page: 1, limit: 50, advanced: true });
  });
});

describe('mergeKanjiPage', () => {
  it('replaces the previous list on page 1', () => {
    const previous = [kanji('a'), kanji('b')];
    const result = mergeKanjiPage(previous, 1, [kanji('c')]);

    expect(result).toEqual([kanji('c')]);
  });

  it('appends onto the previous list for later pages', () => {
    const previous = [kanji('a'), kanji('b')];
    const result = mergeKanjiPage(previous, 2, [kanji('c')]);

    expect(result).toEqual([kanji('a'), kanji('b'), kanji('c')]);
  });
});
