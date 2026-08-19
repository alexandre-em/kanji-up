import { canCreateList, generateListId, MAX_FREE_LISTS } from './lists';

describe('canCreateList', () => {
  it.each([0, 1, MAX_FREE_LISTS - 1])('is true for a free user under the cap (%i lists)', (count) => {
    expect(canCreateList(count, 'free')).toBe(true);
  });

  it('is false for a free user exactly at the cap', () => {
    expect(canCreateList(MAX_FREE_LISTS, 'free')).toBe(false);
  });

  it('is false for a free user over the cap', () => {
    expect(canCreateList(MAX_FREE_LISTS + 5, 'free')).toBe(false);
  });

  it.each([0, MAX_FREE_LISTS, MAX_FREE_LISTS + 5])('is true for a premium user regardless of count (%i lists)', (count) => {
    expect(canCreateList(count, 'premium')).toBe(true);
  });
});

describe('generateListId', () => {
  it('returns a non-empty string', () => {
    const id = generateListId();

    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('does not collide across consecutive calls', () => {
    const ids = Array.from({ length: 50 }, () => generateListId());

    expect(new Set(ids).size).toBe(ids.length);
  });
});
