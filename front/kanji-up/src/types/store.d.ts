type ErrorState = {
  isErrorTriggered: boolean;
  message: string;
  color: string;
};

type SelectedKanjiState = {
  selectedKanji: { [key: string]: Partial<KanjiType> };
  toAdd: { [key: string]: Partial<KanjiType> };
  toRemove: { [key: string]: Partial<KanjiType> };
  status: 'done' | 'inProgress' | 'error' | 'pending';
};

type AnswerType = {
  recognitionId?: string;
  image: string;
  kanji: string;
  status: 'correct' | 'incorrect' | 'toReview';
  message: string | string[];
  answer: PredictionType[] | [];
};

type EvaluationState = {
  totalScore: number;
  totalCard: number;
  time: number;
  answers: Array<AnswerType>;
  status: 'done' | 'inProgress' | 'error' | 'notStarted';
  error: Error | null;
};

type SettingValuesType = {
  username: string;
  accessToken: string | null;
  flashcardNumber: number;
  evaluationCardNumber: number;
  evaluationTime: number;
  useLocalModel: boolean;
};

type UserState = {
  totalScore: number;
  dailyScore: number;
  scores: { [key: string]: number };
};
