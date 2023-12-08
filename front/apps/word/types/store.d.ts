type ErrorState = {
  isErrorTriggered: boolean;
  message: string;
  color: string;
};

type AnswerType = {
  id: string;
  image: string[];
  kanji: string[];
  kanjiId: string[];
  status: 'correct' | 'incorrect' | 'toReview';
  message: string | string[];
  answer: { [index: string]: PredictionType[] };
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
  flashcardNumber: number;
  evaluationCardNumber: number;
  evaluationTime: number;
  useLocalModel: boolean;
};

type UserState = {
  username: string;
  userId: string;
  totalScore: number;
  dailyScore: number;
  scores: { [key: string]: number };
  progression: { [id: string]: number };
};
