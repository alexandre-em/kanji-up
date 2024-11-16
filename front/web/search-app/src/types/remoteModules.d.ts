declare module 'gatewayApp/shared' {
  export const PageLayout: React.ComponentType<any>;
  export const Loading: React.ComponentType<any>;

  export const useKanji: () => {
    searchResult: {
      [search: string]: {
        query: string;
        results: Array<T>;
        current: number;
        totalPages: number;
        totalDocs: number;
      };
    };
    search: (query: string, limit?: number, page?: number) => void;
    searchStatus: 'succeeded' | 'pending' | 'failed' | 'idle';
  };

  export const useWord: () => {
    searchResult: {
      [search: string]: {
        query: string;
        results: Array<T>;
        current: number;
        totalPages: number;
        totalDocs: number;
      };
    };
    search: (query: string, limit?: number, page?: number) => void;
    searchStatus: 'succeeded' | 'pending' | 'failed' | 'idle';
  };

  export const useUser: () => {
    searchResult: {
      [search: string]: any;
    };
    search: (query: string, limit?: number, page?: number) => void;
    searchStatus: 'succeeded' | 'pending' | 'failed' | 'idle';
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

  export const Spacer: React.ComponentType<any>;

  export const logger: {
    log: (message: string, payload?: any) => void;
    info: (message: string, payload?: any) => void;
    error: (message: string, payload?: any) => void;
    warn: (message: string, payload?: any) => void;
  };
}
