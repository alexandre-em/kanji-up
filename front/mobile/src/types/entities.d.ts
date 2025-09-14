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
  score: number;
  prediction: string;
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
};

type UserType = UnregisteredUser & RegisteredUser;
