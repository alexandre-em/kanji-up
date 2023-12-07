export type UpdatedDataResponse = {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: string | null;
  upsertedCount: number;
  matchedCount: number;
};

export interface Pagination<T> {
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
