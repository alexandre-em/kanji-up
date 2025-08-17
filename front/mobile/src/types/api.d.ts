type UpdatedDataResponse = {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: string | null;
  upsertedCount: number;
  matchedCount: number;
};

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

interface DecodedToken {
  name: string;
  email: string;
  exp: number;
  iat: number;
  permissions: string[];
  sub: string;
}

type RequestStatusType = 'idle' | 'pending' | 'succeeded' | 'failed';
type AppType = 'kanji' | 'word';
