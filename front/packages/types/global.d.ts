export type UpdatedDataResponse = {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: string | null;
  upsertedCount: number;
  matchedCount: number;
};

export type ColorType = {
  primary: string;
  primaryDark: string;
  background: string;
  background1: string;
  warning: string;
  info: string;
  secondary: string;
  secondaryDark: string;
  text: string;
  surface: string;
  success: string;
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
};
