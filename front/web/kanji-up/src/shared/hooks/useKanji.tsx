import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../store';
import {
  getOne as getById,
  getAll as getKanjis,
  getRandom as getRandomKanji,
  search as searchKanji,
  selectGetAllResult,
  selectGetAllStatus,
  selectGetOne,
  selectGetOneStatus,
  selectGetRandomResult,
  selectGetRandomStatus,
  selectSearchResult,
  selectSearchStatus,
} from '../../store/reducers/kanji';

import useCore from '@/hooks/useCore';

export default function useKanji() {
  const dispatch = useDispatch<AppDispatch>();
  const kanji = useSelector(selectGetOne);
  const kanjiStatus = useSelector(selectGetOneStatus);
  const kanjis = useSelector(selectGetAllResult);
  const kanjisStatus = useSelector(selectGetAllStatus);
  const random = useSelector(selectGetRandomResult);
  const randomStatus = useSelector(selectGetRandomStatus);
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
    (grade: string, limit = 10, page = 0) => {
      dispatch(getKanjis({ limit, page, grade }));
    },
    [dispatch]
  );

  const getRandom = useCallback((number: number) => {
    dispatch(getRandomKanji(number));
  }, []);

  const search = useCallback(
    (query: string, limit = 10, page = 0) => {
      dispatch(searchKanji({ query, limit, page }));
    },
    [dispatch]
  );

  return {
    kanji,
    kanjiStatus,
    kanjisStatus,
    kanjis,
    random,
    randomStatus,
    searchResult,
    searchStatus,
    getOne,
    getAll,
    getRandom,
    search,
  };
}
