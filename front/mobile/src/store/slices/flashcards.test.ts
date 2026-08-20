import { FlashcardCardProgress } from '../../constants/flashcards';
import { RootState } from '..';
import flashcardsReducer, {
  initialize,
  reviewCard,
  reviewWordCard,
  selectDueFlashcards,
  selectDueWordFlashcards,
} from './flashcards';

const dueProgress: FlashcardCardProgress = { intervalIndex: 0, dueAt: new Date(Date.now() - 1000).toISOString() };
const notDueProgress: FlashcardCardProgress = {
  intervalIndex: 2,
  dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
};

const initialState: RootState['flashcards'] = {
  progress: {},
  wordProgress: {},
  initStatus: 'idle',
};

describe('initialize', () => {
  it('loads both kanji and word progress maps', () => {
    const result = flashcardsReducer(
      initialState,
      initialize.fulfilled({ progress: { k1: dueProgress }, wordProgress: { w1: dueProgress } }, '', undefined),
    );

    expect(result.progress).toEqual({ k1: dueProgress });
    expect(result.wordProgress).toEqual({ w1: dueProgress });
    expect(result.initStatus).toBe('succeeded');
  });
});

describe('reviewCard', () => {
  it('only updates the kanji progress map', () => {
    const result = flashcardsReducer(
      initialState,
      reviewCard.fulfilled({ kanjiId: 'k1', progress: notDueProgress }, '', { kanjiId: 'k1', knew: true }),
    );

    expect(result.progress).toEqual({ k1: notDueProgress });
    expect(result.wordProgress).toEqual({});
  });
});

describe('reviewWordCard', () => {
  it('only updates the word progress map', () => {
    const result = flashcardsReducer(
      initialState,
      reviewWordCard.fulfilled({ wordId: 'w1', progress: notDueProgress }, '', { wordId: 'w1', knew: true }),
    );

    expect(result.wordProgress).toEqual({ w1: notDueProgress });
    expect(result.progress).toEqual({});
  });
});

describe('selectDueFlashcards', () => {
  const asRootState = (state: Partial<RootState>) => state as RootState;

  it('is empty when there is no active kanji list', () => {
    const state = asRootState({
      lists: { lists: {}, activeListId: null, toAdd: {}, toRemove: {}, initStatus: 'succeeded', saveStatus: 'idle' },
      kanji: { entities: {} } as RootState['kanji'],
      flashcards: initialState,
    });

    expect(selectDueFlashcards(state)).toEqual([]);
  });

  it('returns only due kanji from the active list, resolved against cached entities', () => {
    const k1: Partial<KanjiType> = { kanji_id: 'k1' };
    const k2: Partial<KanjiType> = { kanji_id: 'k2' };
    const state = asRootState({
      lists: {
        lists: { listA: { id: 'listA', name: 'A', kanjiIds: ['k1', 'k2', 'k3'] } },
        activeListId: 'listA',
        toAdd: {},
        toRemove: {},
        initStatus: 'succeeded',
        saveStatus: 'idle',
      },
      kanji: { entities: { k1, k2 } } as unknown as RootState['kanji'],
      flashcards: { progress: { k2: notDueProgress }, wordProgress: {}, initStatus: 'succeeded' },
    });

    // k3 has no cached entity (screen's job to fetch it first), k2 isn't due yet
    expect(selectDueFlashcards(state)).toEqual([k1]);
  });
});

describe('selectDueWordFlashcards', () => {
  const asRootState = (state: Partial<RootState>) => state as RootState;

  it('is empty when there is no active word list', () => {
    const state = asRootState({
      wordLists: { lists: {}, activeListId: null, toAdd: {}, toRemove: {}, initStatus: 'succeeded', saveStatus: 'idle' },
      word: { entities: {} } as RootState['word'],
      flashcards: initialState,
    });

    expect(selectDueWordFlashcards(state)).toEqual([]);
  });

  it('returns only due words from the active list, resolved against cached entities', () => {
    const w1: Partial<WordType> = { word_id: 'w1' };
    const w2: Partial<WordType> = { word_id: 'w2' };
    const state = asRootState({
      wordLists: {
        lists: { listA: { id: 'listA', name: 'A', wordIds: ['w1', 'w2', 'w3'] } },
        activeListId: 'listA',
        toAdd: {},
        toRemove: {},
        initStatus: 'succeeded',
        saveStatus: 'idle',
      },
      word: { entities: { w1, w2 } } as unknown as RootState['word'],
      flashcards: { progress: {}, wordProgress: { w2: notDueProgress }, initStatus: 'succeeded' },
    });

    expect(selectDueWordFlashcards(state)).toEqual([w1]);
  });
});
