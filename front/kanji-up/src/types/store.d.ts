type ErrorState = {
  isErrorTriggered: boolean,
  message: string,
};

type SelectedKanjiState = {
  selectedKanji: { [key: string]: Partial<KanjiType> },
  toAdd: { [key: string]: Partial<KanjiType> },
  toRemove: { [key: string]: Partial<KanjiType> },
  status: 'done' | 'inProgress' | 'error' | 'pending',
};

type AnswerType = {
  image: string,
  kanji: string,
  answer: [{
    prediction: string,
    confidence: number,
  }],
};

type EvaluationState = {
  totalScore: number,
  totalCard: number,
  answers: Array<AnswerType>,
  status: 'done' | 'inProgress' | 'error' | 'notStarted',
  error: Error | null,
}

