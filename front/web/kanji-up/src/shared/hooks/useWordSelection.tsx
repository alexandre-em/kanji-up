import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store';
import { initialize as initSelectedWordStore, save as saveSelectedWord, selectedWord } from '../../store/reducers/selectedWord';

export default function useWordSelection() {
  const dispatch = useDispatch<AppDispatch>();
  const selection = useSelector((state: RootState) => state.selectedWord);

  const initialize = () => {
    dispatch(initSelectedWordStore());
  };

  const select = useCallback(
    (payload: WordType) => {
      dispatch(selectedWord.actions.selectWord(payload));
    },
    [dispatch]
  );

  const unselect = useCallback(
    (payload: WordType) => {
      dispatch(selectedWord.actions.unSelectWord(payload));
    },
    [dispatch]
  );

  const cancel = useCallback(() => {
    dispatch(selectedWord.actions.cancel());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(selectedWord.actions.reset());
  }, [dispatch]);

  const save = useCallback(() => {
    dispatch(saveSelectedWord());
  }, [dispatch]);

  return { ...selection, initialize, select, unselect, save, cancel, reset };
}
