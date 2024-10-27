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

type RequestStatusType = 'idle' | 'pending' | 'succeeded' | 'failed';
type AppType = 'kanji' | 'word';
type SvgProps = {
  width: number;
  height: number;
  color?: string;
};
