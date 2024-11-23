declare module 'gatewayApp/shared' {
  export const PageLayout: React.ComponentType<any>;
  export const Loading: React.ComponentType<any>;
  export const Spacer: React.ComponentType<any>;

  interface Pagination<T> {
    docs: Array<T>;
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  }

  type KanjiType = {
    creation_date?: string;
    deleted_at?: string;
    kanji_id: string;
    kanji: Partial<CharacterType>;
    radical?: Partial<RadicalType>;
    reference?: Partial<ReferenceType>;
    examples?: Array<{ japanese: string; meaning: string }>;
  };

  type CharacterType = {
    character_id: string;
    character?: string;
    meaning?: Array<string>;
    onyomi?: Array<string>;
    kunyomi?: Array<string>;
    strokes?: number;
    image?: string;
  };

  export const useKanji: () => {
    kanjis: Pagination<KanjiType> | null;
    getAll: (grade: string, limit = 10, page = 0) => void;
    kanjisStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  };

  type StatusType = 'succeeded' | 'pending' | 'failed' | 'idle';

  export const useKanjiSelection: () => {
    selectedKanji: { [key: string]: Partial<KanjiType> };
    toAdd: { [key: string]: Partial<KanjiType> };
    toRemove: { [key: string]: Partial<KanjiType> };
    initStatus: StatusType;
    saveStatus: StatusType;
    initialize: () => void;
    select: (payload: KanjiType) => void;
    unselect: (payload: KanjiType) => void;
    cancel: () => void;
    reset: () => void;
    save: () => void;
  };

  export const useSession: () => {
    accessToken: string;
    name: string;
    email: string;
    iat?: number;
    exp?: number;
    sub: string;
    status?: 'idle' | 'pending' | 'succeeded' | 'failed';
  };

  export const useUserScore: () => {
    kanji: {
      total_score: number;
      dailyScore: number;
      scores: { [key: string]: number };
      progression: { [id: string]: number };
      status: StatusType;
    };
    getKanji: (id: string) => void;
  };

  export const TypographyH1: React.ComponentType<any>;
  export const TypographyH2: React.ComponentType<any>;
  export const TypographyH3: React.ComponentType<any>;
  export const TypographyH4: React.ComponentType<any>;
  export const TypographyP: React.ComponentType<any>;
  export const TypographyBlockquote: React.ComponentType<any>;
  export const TypographyList: React.ComponentType<any>;
  export const TypographyInlineCode: React.ComponentType<any>;
  export const TypographyLead: React.ComponentType<any>;
  export const TypographyLarge: React.ComponentType<any>;
  export const TypographySmall: React.ComponentType<any>;
  export const TypographyMuted: React.ComponentType<any>;

  export const logger: {
    log: (message: string, payload?: any) => void;
    info: (message: string, payload?: any) => void;
    error: (message: string, payload?: any) => void;
    warn: (message: string, payload?: any) => void;
  };

  export const KANJI_PROGRESSION_MAX;
}
