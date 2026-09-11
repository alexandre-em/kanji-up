import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { core } from '../../../../../services/http';

type KanjiListCategory = 'jlpt' | 'grade' | 'advanced';

type KanjiListPageState = {
  kanjis: KanjiType[];
  page: number;
  totalPage: number;
  status: RequestStatusType;
};

const PAGE_SIZE = 50;

export function buildGetAllParams(category: KanjiListCategory, difficulty: string, page: number) {
  const typeParams = category === 'advanced' ? { advanced: true } : { [category]: difficulty };
  return { page, limit: PAGE_SIZE, ...typeParams };
}

export function mergeKanjiPage(previousKanjis: KanjiType[], page: number, newDocs: KanjiType[]): KanjiType[] {
  return page === 1 ? newDocs : previousKanjis.concat(newDocs);
}

const initialPageState: KanjiListPageState = { kanjis: [], page: 0, totalPage: 0, status: 'idle' };

export function useKanjiListPage(category: KanjiListCategory, difficulty: string) {
  const [state, setState] = useState<KanjiListPageState>(initialPageState);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    (page: number) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((prev) => ({ ...prev, status: 'pending' }));

      core
        .kanjiService!.getAll(buildGetAllParams(category, difficulty, page), { signal: controller.signal })
        .then((response) => {
          setState((prev) => ({
            kanjis: mergeKanjiPage(prev.kanjis, page, response.data.docs),
            page: response.data.page,
            totalPage: response.data.totalPages,
            status: 'succeeded',
          }));
        })
        .catch((error) => {
          setState((prev) => ({ ...prev, status: axios.isCancel(error) ? 'idle' : 'failed' }));
        });
    },
    [category, difficulty],
  );

  useEffect(() => {
    setState(initialPageState);
    fetchPage(1);
    return () => controllerRef.current?.abort();
  }, [fetchPage]);

  const fetchNextPage = useCallback(() => {
    if (state.status === 'pending' || state.page === 0 || state.page >= state.totalPage) return;
    fetchPage(state.page + 1);
  }, [fetchPage, state.status, state.page, state.totalPage]);

  return { kanjis: state.kanjis, status: state.status, fetchNextPage };
}
