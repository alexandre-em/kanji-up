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
    const { service, findOne } = buildService({ word_id: 'abc' });

    await service.findExactWordMatch('そば');

    // そば/ラーメン-style words are stored with word: [] and only a reading — the $size: 0
    // guard is what stops this from also matching a kanji word sharing that pronunciation
    // (きょう must never match 今日, which has a real, non-empty word array)
    expect(findOne).toHaveBeenCalledWith({
      deleted_at: null,
      $or: [{ word: 'そば' }, { word: { $size: 0 }, reading: 'そば' }],
    });
  });

  it('projects only word_id, not the full document', async () => {
    const { service, select } = buildService({ word_id: 'abc' });

    await service.findExactWordMatch('そば');

    expect(select).toHaveBeenCalledWith('word_id');
  });

  it('resolves to null when nothing matches', async () => {
    const { service } = buildService(null);

    await expect(service.findExactWordMatch('存在しない単語')).resolves.toBeNull();
  });
});
