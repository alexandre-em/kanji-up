import { WordService } from './word.service';

describe('WordService.searchWord', () => {
  function buildService() {
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

    chain.facet = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ totalDocs: [{ total: 0 }], data: [] }]) });

    const model = { aggregate: jest.fn().mockReturnValue(chainableProxy) } as never;
    const sentenceService = {} as never;

    return { service: new WordService(model, sentenceService), search: () => chain.search };
  }

  it('boosts an exact, un-analyzed match on word/reading above the general CJK match', async () => {
    const { service, search } = buildService();

    await service.searchWord('そば');

    expect(search()).toHaveBeenCalledWith({
      index: 'default',
      compound: {
        should: [{ text: { query: 'そば', path: ['word', 'reading', 'definition.meaning'] } }, { text: { query: 'そば', path: ['word.exact', 'reading.exact'], score: { boost: { value: 5 } } } }],
        minimumShouldMatch: 1,
      },
    });
  });
});
