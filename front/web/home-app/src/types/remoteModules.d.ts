declare module 'gatewayApp/shared' {
  export const PageLayout: React.ComponentType<any>;
  export const Spacer: React.ComponentType<any>;

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
    [key: string]: {
      total_score: number;
      dailyScore: number;
      scores: {
        [timestamp: string]: number;
      };
      progression: {
        [kanji: string]: number;
      };
      status: 'idle' | 'pending' | 'succeeded' | 'failed';
    };
    getKanji: (id: string) => void;
    getWord: (id: string) => void;
  };

  export const useNavigation: () => {
    goToHome: () => void;
    goToKanjis: () => void;
    goToKanji: () => void;
    goToWords: () => void;
    goToWord: () => void;
    goToSearch: () => void;
    goToUser: () => void;
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

  export const core: {
    accessToken: string;
  };

  export const formatScore = (score: number) => string;
  export const formatDateKey = () => string;
}

declare module 'searchApp/SearchBar' {
  const SearchBar: React.ComponentType<any>;
  export default SearchBar;
}
