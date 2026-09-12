import { WordService } from './word.service';

describe('WordService.findExactWordMatch', () => {
  function buildService(execResult: unknown) {
    const select = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(execResult) });
    const findOne = jest.fn().mockReturnValue({ select });
    const model = { findOne } as never;
    const sentenceService = {} as never;

    return { service: new WordService(model, sentenceService), findOne, select };
  }

  it('matches by spelling, or by reading only for a word with no kanji form at all', async () => {
    const { service, findOne } = buildService({ word_id: 'abc', word: ['そば'], reading: ['そば'] });

    await service.findExactWordMatch('そば');

    // そば/ラーメン-style words are stored with word: [] and only a reading — the $size: 0
    // guard is what stops this from also matching a kanji word sharing that pronunciation
    // (きょう must never match 今日, which has a real, non-empty word array)
    expect(findOne).toHaveBeenCalledWith({
      deleted_at: null,
      $or: [{ word: 'そば' }, { word: { $size: 0 }, reading: 'そば' }],
    });
  });

  it('selects only word_id, word and reading, not the full document', async () => {
    const { service, select } = buildService({ word_id: 'abc', word: ['そば'], reading: ['そば'] });

    await service.findExactWordMatch('そば');

    expect(select).toHaveBeenCalledWith('word_id word reading -_id');
  });

  it('resolves to null when nothing matches', async () => {
    const { service } = buildService(null);

    await expect(service.findExactWordMatch('存在しない単語')).resolves.toBeNull();
  });

  it('pairs the reading positionally when spellings and readings line up', async () => {
    const { service } = buildService({
      word_id: 'ff7f527e',
      word: ['辞書', '辭書'],
      reading: ['じしょ'],
    });

    // reading.length (1) !== word.length (2) here, so it can't pair positionally — falls back
    // to the word's first reading, which is correct since both spellings share one reading
    await expect(service.findExactWordMatch('辭書')).resolves.toEqual({ word_id: 'ff7f527e', reading: 'じしょ' });
  });

  it('falls back to reading[0] when spelling and reading counts differ', async () => {
    const { service } = buildService({
      word_id: '8e7cfe95',
      word: ['醤油', 'しょう油', '醬油', '正油'],
      reading: ['しょうゆ', 'しょうゆう', 'せうゆ', 'しょゆ', 'しょゆう'],
    });

    await expect(service.findExactWordMatch('正油')).resolves.toEqual({ word_id: '8e7cfe95', reading: 'しょうゆ' });
  });

  it('uses the query itself as the reading for a kana-only word (word: [])', async () => {
    const { service } = buildService({ word_id: 'abc', word: [], reading: ['そば'] });

    await expect(service.findExactWordMatch('そば')).resolves.toEqual({ word_id: 'abc', reading: 'そば' });
  });
});
