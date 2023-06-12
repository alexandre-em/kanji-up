import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { error, evaluation as evaluationSlice, user } from '../../store/slices';

import { RootState } from '../../store';

interface useHandlersProps {
  evaluation: boolean;
  model: any;
  navigation: any;
  setDialog: Function;
}

export default function useHandlers({ evaluation, model, navigation, setDialog }: useHandlersProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState({ title: '', content: '', component: undefined });
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const settingsState = useSelector((state: RootState) => state.settings);
  const evaluationState = useSelector((state: RootState) => state.evaluation);

  const handleFinish = React.useCallback(({ title, content, component }: { title: string; content: string; component: any }) => {
    setMessage({ title, content, component });
    setDialog(true);
  }, []);

  const handleConfirmFinish = React.useCallback(() => {
    if (user) {
      dispatch(user.actions.addScoreDaily(Math.round(evaluationState.totalScore)));
    }

    dispatch(evaluationSlice.actions.reset({ time: settingsState.evaluationTime, totalCard: settingsState.evaluationCardNumber }));
    navigation.goBack();
  }, [evaluationState]);

  const sKanji = React.useMemo(() => Object.values(kanjiState.selectedKanji), [kanjiState]);

  useEffect(() => {
    if (Object.keys(kanjiState.selectedKanji).length < 1) {
      setMessage({ title: `Warning: no kanji`, content: "You havn't selected kanji to start a flashcard session", component: undefined });
      setDialog(true);
    }
  }, [kanjiState]);

  // useEffect(() => {
  //   (async () => {
  //     if (model && !model.model && evaluation && !loading) {
  //       setLoading(true);
  //       try {
  //         await model.loadModel();
  //       } catch (err: any) {
  //         dispatch(error.actions.update({ message: err.message }));
  //       } finally {
  //         setLoading(false);
  //       }
  //     }
  //   })()
  // }, [model, evaluation, loading]);

  return {
    sKanji,
    message,
    handleFinish,
    handleConfirmFinish,
  };
}
