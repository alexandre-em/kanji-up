import { WordService } from './word.service';

describe('WordService.searchWord', () => {
  function buildService(fuzzyDocs: { word_id: string }[], exactMatch: { word_id: string } | null) {
    const chain: Record<string, jest.Mock> = {};
    const chainable = (name: string) => {
      chain[name] = jest.fn().mockReturnValue(chainableProxy);
      return chain[name];
    };
    const chainableProxy = new Proxy(
      {},
      {
        get: (_target, prop: string) => chain[prop] ?? chainable(prop),
      }
    );

    chain.facet = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ totalDocs: [{ total: fuzzyDocs.length }], data: fuzzyDocs }]),
    });

    const select = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(exactMatch) });
    const findOne = jest.fn().mockReturnValue({ select });
    const model = { aggregate: jest.fn().mockReturnValue(chainableProxy), findOne } as never;
    const sentenceService = {} as never;

    return { service: new WordService(model, sentenceService), search: () => chain.search, findOne };
  }

  it('uses a plain CJK text search, not Atlas Search relevance tuning, to find fuzzy hits', async () => {
    const { service, search } = buildService([], null);

    await service.searchWord('そば');

    expect(search()).toHaveBeenCalledWith({ index: 'default', text: { query: 'そば', path: { wildcard: '*' } } });
  });

  it('looks up an exact match via plain Mongo (proven reliable on array fields), not Atlas Search', async () => {
    const { service, findOne } = buildService([], null);

    await service.searchWord('そば');

    expect(findOne).toHaveBeenCalledWith({ deleted_at: null, $or: [{ word: 'そば' }, { reading: 'そば' }] });
  });

  it('puts the exact match first, ahead of every fuzzy hit', async () => {
    const { service } = buildService([{ word_id: 'compound-1' }, { word_id: 'compound-2' }], { word_id: 'exact-1' });

    const results = await service.searchWord('そば', 1, 20);

    expect(results.docs.map((doc) => doc.word_id)).toEqual(['exact-1', 'compound-1', 'compound-2']);
  });

  it('does not duplicate the exact match if it was already among the fuzzy hits', async () => {
    const { service } = buildService([{ word_id: 'exact-1' }, { word_id: 'compound-2' }], { word_id: 'exact-1' });

    const results = await service.searchWord('そば', 1, 20);

    expect(results.docs.map((doc) => doc.word_id)).toEqual(['exact-1', 'compound-2']);
  });

  it('keeps the page at exactly `limit` docs even after inserting the exact match', async () => {
    const { service } = buildService([{ word_id: 'c1' }, { word_id: 'c2' }, { word_id: 'c3' }], { word_id: 'exact-1' });

    const results = await service.searchWord('そば', 1, 3);

    expect(results.docs).toHaveLength(3);
    expect(results.docs.map((doc) => doc.word_id)).toEqual(['exact-1', 'c1', 'c2']);
  });

  it('leaves the fuzzy results untouched when nothing matches exactly', async () => {
    const { service } = buildService([{ word_id: 'compound-1' }], null);

    const results = await service.searchWord('そば', 1, 20);

    expect(results.docs.map((doc) => doc.word_id)).toEqual(['compound-1']);
  });

  it('only checks for an exact match on the first page', async () => {
    const { service, findOne } = buildService([{ word_id: 'compound-1' }], null);

    await service.searchWord('そば', 2, 20);

    expect(findOne).not.toHaveBeenCalled();
  });
});
