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
}
