import { WordService } from './word.service';

describe('WordService.findExactWordMatch', () => {
  function buildService(execResult: unknown) {
    const select = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(execResult) });
    const findOne = jest.fn().mockReturnValue({ select });
    const model = { findOne } as never;
    const sentenceService = {} as never;

    return { service: new WordService(model, sentenceService), findOne, select };
  }

  it('queries by spelling only, excluding soft-deleted words', async () => {
    const { service, findOne } = buildService({ word_id: 'abc' });

    await service.findExactWordMatch('そば');

    expect(findOne).toHaveBeenCalledWith({ word: 'そば', deleted_at: null });
  });

  it('does not query by reading — a shared pronunciation must not count as a spelling match', async () => {
    const { service, findOne } = buildService(null);

    await service.findExactWordMatch('きょう');

    const query = findOne.mock.calls[0][0];
    expect(query).not.toHaveProperty('reading');
    expect(query).not.toHaveProperty('$or');
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
