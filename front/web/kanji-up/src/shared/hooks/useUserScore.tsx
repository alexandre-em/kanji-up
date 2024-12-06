import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { core } from '../../shared';
import { AppDispatch, RootState } from '../../store';
import { getKanjiScore, getWordScore, userScore } from '../../store/reducers/userScore';

import useCore from '@/hooks/useCore';

export default function useUserScore() {
  const dispatch = useDispatch<AppDispatch>();
  const userScoreState = useSelector((state: RootState) => state.userScore);

  useCore();

  const getKanji = useCallback((id: string) => {
    dispatch(getKanjiScore({ id }));
  }, []);

  const getWord = useCallback((id: string) => {
    dispatch(getWordScore({ id }));
  }, []);

  const addDaily = useCallback(
    (score: number, app: AppType) => {
      dispatch(userScore.actions.addScoreDaily({ app, score }));
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch(userScore.actions.reset());
  }, [dispatch]);

  const getRanking = useCallback((app: AppType) => {
    core.userService?.getRanking(app);
  }, []);

  return { ...userScoreState, addDaily, getWord, getKanji, getRanking, reset };
}
