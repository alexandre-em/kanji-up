import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../store';
import {
  getOne as getById,
  getAll as getWords,
  search as searchWord,
  selectGetAllResult,
  selectGetAllStatus,
  selectGetOne,
  selectGetOneStatus,
  selectSearchResult,
  selectSearchStatus,
} from '../../store/reducers/word';

import useCore from '@/hooks/useCore';

export default function useWord() {
  const dispatch = useDispatch<AppDispatch>();
  const word = useSelector(selectGetOne);
  const wordStatus = useSelector(selectGetOneStatus);
  const words = useSelector(selectGetAllResult);
  const wordsStatus = useSelector(selectGetAllStatus);
  const searchResult = useSelector(selectSearchResult);
  const searchStatus = useSelector(selectSearchStatus);

  useCore();

  const getOne = useCallback(
    (id: string) => {
      dispatch(getById(id));
    },
    [dispatch]
  );

  const getAll = useCallback(
    (limit = 10, page = 1) => {
      dispatch(getWords({ limit, page }));
    },
    [dispatch]
  );

  const search = useCallback(
    (query: string, limit = 10, page = 1) => {
      dispatch(searchWord({ query, limit, page }));
    },
    [dispatch]
  );

  return {
    word,
    wordStatus,
    wordsStatus,
    words,
    searchResult,
    searchStatus,
    getOne,
    getAll,
    search,
  };
}
