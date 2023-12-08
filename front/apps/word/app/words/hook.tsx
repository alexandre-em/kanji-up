import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useGlobalSearchParams } from 'expo-router';

import core from 'kanji-app-core';
import { WordType } from 'kanji-app-types';

import { RootState } from 'store';
import { error, word } from 'store/slices';

export default function useWordHook() {
  const dispatch = useDispatch();
  const [details, setDetails] = useState<WordType | null>(null);
  const wordState = useSelector((state: RootState) => state.word);
  const { id, access_token } = useGlobalSearchParams();

  const isSelected = useMemo(() => wordState.find((w) => w.word_id === id), [wordState, id]);

  const handlePress = useCallback(() => {
    if (details) {
      if (isSelected) {
        dispatch(word.actions.removeWord(details));
      } else {
        dispatch(word.actions.addWord(details));
      }
    }
  }, [isSelected, details]);

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();

    if (id && core && core.wordService) {
      core.wordService
        .getOne({ id: id as string }, { cancelToken: cancelToken.token })
        .then((res) => setDetails(res.data))
        .catch((err) =>
          dispatch(error.actions.update({ message: axios.isCancel(err) ? 'Previous action cancelled.' : err.message }))
        );
    }

    return () => {
      cancelToken.cancel();
    };
  }, [id]);

  return {
    details,
    isSelected,
    handlePress,
  };
}
