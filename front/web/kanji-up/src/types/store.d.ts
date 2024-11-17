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

type SettingValuesType = {
  username: string;
  userId: string;
  flashcardNumber: number;
  evaluationCardNumber: number;
  evaluationTime: number;
  useLocalModel: boolean;
};

type UserState = {
  total_score: number;
  dailyScore: number;
  scores: { [key: string]: number };
  progression: { [id: string]: number };
  status: StatusType;
};

type SearchResult<T> = {
  query: string;
  results: Array<T>;
  current: number;
  totalPages: number;
  totalDocs: number;
  nextPage?: number | null;
};
