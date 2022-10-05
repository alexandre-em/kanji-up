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


