type ErrorState = {
  isErrorTriggered: boolean;
  message: string;
  color: string;
};

type StatusType = 'succeeded' | 'pending' | 'failed' | 'idle';

type SelectedKanjiState = {
  selectedKanji: { [key: string]: Partial<KanjiType> };
  toAdd: { [key: string]: Partial<KanjiType> };
  toRemove: { [key: string]: Partial<KanjiType> };
  initStatus: StatusType;
  saveStatus: StatusType;
};

type SelectionList = {
  id: string;
  name: string;
  kanjiIds: string[];
};

type ListsState = {
  lists: Record<string, SelectionList>;
  activeListId: string | null;
  // Staged edits for whichever list is currently active — mirrors SelectedKanjiState's
  // toAdd/toRemove pattern, just committed onto the active list's kanjiIds instead of a flat pool
  toAdd: { [key: string]: Partial<KanjiType> };
  toRemove: { [key: string]: Partial<KanjiType> };
  initStatus: StatusType;
  saveStatus: StatusType;
};

type SelectedWordState = {
  selectedWord: { [key: string]: Partial<WordType> };
  toAdd: { [key: string]: Partial<WordType> };
  toRemove: { [key: string]: Partial<WordType> };
  initStatus: StatusType;
  saveStatus: StatusType;
};

type AnswerType = {
  recognitionId?: string;
  image: string;
  kanji: string;
  kanjiId: string;
  status: 'correct' | 'incorrect' | 'review';
  message: string | string[];
  answer: PredictionType[] | [];
};

type EvaluationState = {
  totalScore: number;
  totalCard: number;
  time: number;
  answers: Array<AnswerType>;
  status: StatusType;
  error: Error | null;
};

type UserState = {
  userId: string;
  name: string;
  macAddress: string;
  isAnonymous: boolean;
  adsDeactivated: boolean;
  subscriptionPlan: SubscriptionPlan;
  email: string | null;
  picture: string | null;
  providerId: string | null;
  subscribedAt: Date | null;
  subscribedUntil: Date | null;
  credits: number;
  unlockedDifficulties: string[];
  unlockedKanji: string[];
  totalScore: number;
  dailyScores: Record<string, number>;
  progression: Record<string, { correct: number; total: number } | number>;
  wordProgression: Record<string, { correct: number; total: number }>;

  getUserStatus: StatusType;
  createUserStatus: StatusType;
};

type SearchResult<T> = {
  query: string;
  results: Array<T>;
  current: number;
  totalPages: number;
  totalDocs: number;
  nextPage?: number | null;
};
