type SvgProps = {
  width: number;
  height: number;
};

type GameMode = 'onyomi' | 'kunyomi';

type QuestionType = {
  question_id: string;
  category: string;
  question: string;
  level: string;
  answer: string[];
  other_answer?: string[];
  meaning: string[] | undefined;
};

type ProblemStatus = 'pending' | 'valid' | 'invalid' | 'skipped' | 'ongoing';

type ProblemType = {
  status: ProblemStatus;
  question: QuestionType;
};
