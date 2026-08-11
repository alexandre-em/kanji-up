type CharacterType = {
  character_id: string;
  character?: string;
  meaning?: Array<string>;
  onyomi?: Array<string>;
  kunyomi?: Array<string>;
  strokes?: number;
  image?: string;
  jlpt: number;
};

type RadicalType = {
  name?: {
    hiragana: string;
    romaji: string;
  };
  character?: string;
  strokes?: number;
  image?: string;
  meaning?: Array<string>;
  radical_id: string;
};

type ReferenceType = {
  grade?: string;
  kodansha?: string;
  classic_nelson?: string;
  reference_id: string;
};

type PredictionType = {
  confidence: number;
  label: string;
};

type RecognitionType = {
  recognition_id: string;
  image: string;
  kanji: string;
  predictions: Array<PredictionType>;
};

type KanjiType = {
  creation_date?: string;
  deleted_at?: string;
  kanji_id: string;
  kanji: Partial<CharacterType>;
  radical?: Partial<RadicalType>;
  reference?: Partial<ReferenceType>;
  examples?: Array<{ japanese: string; meaning: string }>;
};

type SubscriptionPlan = 'free' | 'premium';

type SentenceType = {
  sentence_id: string;
  word: string;
  sentence: string;
  translation: string;
  created_at: Date;
  deleted_at: Date | null;
};

type DefinitionType = {
  meaning: string[];
  type: string[];
  relation: {
    index: number;
    related_word: Partial<WordType>[];
  }[];
  example: Partial<SentenceType>[];
};

type WordType = {
  word_id: string;
  word: string[];
  reading: string[];
  definition: DefinitionType[];
};

type UnregisteredUser = {
  userId: string;
  name: string;
  macAddress: string;
  isAnonymous: boolean;
  adsDeactivated: boolean;
  subscriptionPlan: SubscriptionPlan;

  createdAt: Date;
  updatedAt: Date;
};

type RegisteredUser = {
  // if registered
  email: string | null;
  picture: string | null;
  providerId: string | null;
  credits: number;
  subscribedAt: Date | null;
  subscribedUntil: Date | null;
  // Bulk tier unlocks ("jlpt:3", "grade:8") and individually unlocked kanji_id
  unlockedDifficulties: string[];
  unlockedKanji: string[];
};

// Per-kanji / per-word accuracy (correct / total attempts) — see src/constants/progression.ts
// for the mastery threshold. Kanji progression values may still be a plain number for accounts
// predating this shape (the old momentum score); normalizeProgressionEntry handles that. Word
// progression is new and never has that legacy shape.
type KanjiProgressionType = {
  totalScore: number;
  dailyScores: Record<string, number>;
  progression: Record<string, { correct: number; total: number } | number>;
  wordProgression: Record<string, { correct: number; total: number }>;
};

type UserType = UnregisteredUser & RegisteredUser & KanjiProgressionType;

type SessionKind = 'kanji' | 'word' | 'other';
type SessionStatusType = 'in_progress' | 'finished' | 'abandoned';
type SessionQuestionStatus = 'idle' | 'correct' | 'incorrect' | 'review';

type KanjiSessionQuestion = {
  kanjiId: string;
  image: string | null;
  strokesCount: number;
  status: SessionQuestionStatus;
  userConfirmation: boolean | null;
};

type WordSessionQuestion = {
  wordId: string;
  slots: { image: string | null; predictions: PredictionType[]; strokesCount: number }[];
  status: SessionQuestionStatus;
  userConfirmation: boolean | null;
};

type SessionType = {
  sessionId: string;
  userId: string;
  type: SessionKind;
  status: SessionStatusType;
  questions: (KanjiSessionQuestion | WordSessionQuestion | Record<string, unknown>)[];
  currentIndex: number;
  score: number | null;

  createdAt: string;
  updatedAt: string;
};

type MissionTaskKey = 'kanjiSession' | 'wordSession' | 'kanjiMastery';

type DailyMissionType = {
  userId: string;
  date: string;
  tasks: Record<MissionTaskKey, boolean>;
  rewardClaimed: boolean;
};

type ScanTokenType = {
  text: string;
  // null when this stretch of text isn't a known word (kana, punctuation, unrecognized)
  wordId: string | null;
};

type ScanResultType = {
  scanId: string;
  imageUrl: string;
  recognizedText: string;
  tokens: ScanTokenType[];
};

type ScanSummaryType = {
  scanId: string;
  imageUrl: string;
  recognizedText: string;
  createdAt: string;
};

type PaginatedScansType = {
  docs: ScanSummaryType[];
  totalDocs: number;
};
