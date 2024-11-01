import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../store';
import {
  getOne as getById,
  search as searchUser,
  selectGetOne,
  selectGetOneStatus,
  selectSearchResult,
  selectSearchStatus,
} from '../../store/reducers/user';

import useCore from '@/hooks/useCore';

export default function useUser() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectGetOne);
  const userStatus = useSelector(selectGetOneStatus);
  const searchResult = useSelector(selectSearchResult);
  const searchStatus = useSelector(selectSearchStatus);

  useCore();

  const getOne = useCallback(
    (id: string) => {
      dispatch(getById(id));
    },
    [dispatch]
  );

  const search = useCallback(
    (query: string) => {
      dispatch(searchUser({ query }));
    },
    [dispatch]
  );

  return {
    user,
    userStatus,
    searchResult,
    searchStatus,
    getOne,
    search,
  };
}
