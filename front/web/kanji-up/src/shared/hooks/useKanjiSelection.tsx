import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store';
import {
  initialize as initSelectedKanjiStore,
  save as saveSelectedKanji,
  selectedKanji,
} from '../../store/reducers/selectedKanji';

export default function useKanjiSelection() {
  const dispatch = useDispatch<AppDispatch>();
  const selection = useSelector((state: RootState) => state.selectedKanji);

  const initialize = () => {
    dispatch(initSelectedKanjiStore());
  };

  const select = useCallback(
    (payload: KanjiType) => {
      dispatch(selectedKanji.actions.selectKanji(payload));
    },
    [dispatch]
  );

  const unselect = useCallback(
    (payload: KanjiType) => {
      dispatch(selectedKanji.actions.unSelectKanji(payload));
    },
    [dispatch]
  );

  const cancel = useCallback(() => {
    dispatch(selectedKanji.actions.cancel());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(selectedKanji.actions.reset());
  }, [dispatch]);

  const save = useCallback(() => {
    dispatch(saveSelectedKanji());
  }, [dispatch]);

  return { ...selection, initialize, select, unselect, save, cancel, reset };
}
