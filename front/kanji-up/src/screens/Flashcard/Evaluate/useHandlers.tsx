import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image, Platform, ScrollView, View } from 'react-native';
import { Divider, IconButton, List } from 'react-native-paper';

import { RootState } from '../../../store';
import { error, evaluation } from '../../../store/slices';
import { recognitionService } from '../../../service';
import { colors } from '../../../constants';

interface UseHandlersEvaluateProps {
  model: any;
  kanji: Partial<KanjiType>[];
  canvasRef: any;
  progressCircleRef: any;
  onFinish: Function;
}

export default function useHandlersEvaluate({ model, kanji, canvasRef, progressCircleRef, onFinish }: UseHandlersEvaluateProps) {
  const i = 0;
  const dispatch = useDispatch();
  const evaluationState = useSelector((state: RootState) => state.evaluation);
  const settingsState = useSelector((state: RootState) => state.settings);
  const [timer, setTimer] = useState<number>(settingsState.evaluationTime || 60);
  const [kanjiQueue, setKanjiQueue] = useState<Partial<KanjiType>[] | null>(null);
  const [start, setStart] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [promiseQueue, setPromiseQueue] = useState<Promise<any>[]>([]);

  const handleClear = useCallback(() => {
    if (canvasRef && canvasRef.current) {
      canvasRef.current.handleClear();
    }
  }, [canvasRef]);

  const handleValidate = useCallback(async () => {
    if (canvasRef?.current && kanjiQueue) {
      const strokeCount = canvasRef?.current.strokeCount;
      const isValid = strokeCount === kanjiQueue[i].kanji?.strokes;
      const details = kanjiQueue[i].kanji;
      console.warn('Image transformation to Base64');
      const imageBase64: string = Platform.OS === 'web' ? canvasRef.current.getUri() : (await canvasRef.current.getUri()).split('data:image/jpeg;base64,')[1];
      const imageBase64WFormat = Platform.OS === 'web' ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

      if (!isValid) {
        dispatch(
          evaluation.actions.addAnswer({
            kanji: details!.character as string,
            image: imageBase64WFormat,
            answer: [],
            status: 'incorrect',
            message: strokeCount === 0 ? 'This kanji has been skipped' : "The stroke number wasn't correct",
          })
        );
      } else {
        // Dispatch score
        // FIX: Make it async
        console.warn('Before Predicion');
        model
          .predict(imageBase64)
          .then((prediction: any) => {
            const predictedKanji = prediction.find((p: any) => p.prediction === details!.character);
            // const recognition = await uploadImage(canvasRef, details!.character as string, prediction) as AxiosResponse<RecognitionType>;

            if (!predictedKanji) {
              dispatch(
                evaluation.actions.addAnswer({
                  kanji: details!.character as string,
                  recognitionId: `${counter}`,
                  image: imageBase64WFormat,
                  answer: prediction,
                  status: 'toReview',
                  message: 'The drawed kanji seems incorrect, please confirm',
                })
              );
            } else {
              dispatch(
                evaluation.actions.addAnswer({
                  kanji: details!.character as string,
                  recognitionId: `${counter}`,
                  image: imageBase64WFormat,
                  answer: prediction,
                  status: 'correct',
                  message: 'Correct !',
                })
              );
              const grade = kanjiQueue[i].reference?.grade;
              dispatch(evaluation.actions.addPoints(Math.max(predictedKanji?.confidence * 100 * (grade === 'custom' ? 8 : parseInt(grade || '1', 10)), 10)));
            }
            console.warn('Prediction completed');
          })
          .catch((err: any) => {
            dispatch(error.actions.update({ message: err.message }));
          });
        console.warn('After Prediction?');
      }
    }

    handleClear();
    setKanjiQueue((prev) => prev?.slice(1) || prev);
    setCounter((prev) => prev + 1);
    // next card
    if (Platform.OS === 'web' && settingsState) {
      setTimer(settingsState.evaluationTime);
    } else {
      if (progressCircleRef?.current) {
        progressCircleRef.current.reAnimate();
      }
    }
  }, [model, kanjiQueue, canvasRef, progressCircleRef, evaluation, settingsState, counter]);

  const handleConfirm = useCallback(
    (id: number, ans?: AnswerType) => {
      dispatch(evaluation.actions.updateAnswerStatus({ id, status: 'correct', message: 'This answer has been validated by the user' }));
      dispatch(evaluation.actions.addPoints(10));
      if (ans?.recognitionId) {
        recognitionService.userValidation(true, ans.recognitionId);
      }
    },
    [dispatch]
  );

  const handleUnvalidate = useCallback(
    (id: number) => {
      dispatch(evaluation.actions.updateAnswerStatus({ id, status: 'incorrect', message: 'This answer has been unvalidated by the user' }));
    },
    [dispatch]
  );

  const results = useMemo(() => {
    // if (evaluationState.status === 'done' && promiseQueue.length >= 0) {
    if (false) {
      return null;
    }
    return (
      <ScrollView style={Platform.OS === 'web' ? { maxHeight: 275 } : { height: '65%' }}>
        {evaluationState.answers.map((a, ind) => (
          <View key={`result-${ind}`}>
            <List.Item
              title={`Answer was ${a.kanji}`}
              titleStyle={{ fontWeight: '700', color: colors.primary }}
              description={a.message}
              left={() => <Image source={{ uri: a.image }} style={{ width: 40, height: 40, resizeMode: 'contain' }} />}
              right={(props) =>
                a.status === 'toReview' && (
                  <View {...props} style={{ flexDirection: 'row' }}>
                    <IconButton icon="checkbox-marked-circle-outline" color="#bdf56e" onPress={() => handleConfirm(i)} />
                    <IconButton icon="close-circle-outline" color={colors.primaryDark} onPress={() => handleUnvalidate(i)} />
                  </View>
                )
              }
            />
            {i < evaluationState.answers.length - 1 && <Divider />}
          </View>
        ))}
      </ScrollView>
    );
  }, [evaluationState]);

  useEffect(() => {
    setKanjiQueue(kanji.sort(() => 0.5 - Math.random()));
  }, [kanji]);

  useEffect(() => {
    if (dispatch) {
      if (kanjiQueue && kanjiQueue.length > 0 && !start) {
        dispatch(evaluation.actions.initialize({ time: settingsState.evaluationTime, totalCard: settingsState.evaluationCardNumber }));
        setStart(true);
      }
      const isLimitReached = counter >= settingsState.evaluationCardNumber;
      if (start && kanjiQueue && (kanjiQueue.length <= 0 || isLimitReached)) {
        if (!isLimitReached) {
          setKanjiQueue(kanji.sort(() => 0.5 - Math.random()));
        } else {
          if (evaluationState.status !== 'done' && evaluationState.status !== 'error') {
            dispatch(evaluation.actions.finish());
          }
        }
      }
    }
  }, [dispatch, kanjiQueue, start, evaluationState, kanji, settingsState, counter]);

  useEffect(() => {
    if (evaluationState.status === 'done' || evaluationState.status === 'error') {
      onFinish({ title: 'Completed', content: `You have completed with a score of ${evaluationState.totalScore}`, component: results });
    }
  }, [evaluationState, settingsState, results]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      let interval: number = settingsState.evaluationTime;
      if (timer > 0) {
        interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      } else {
        handleValidate();
      }

      return () => {
        clearInterval(interval);
      };
    }

    return () => {};
  }, [timer]);

  return {
    counter,
    kanjiQueue,
    timer,
    handleClear,
    handleConfirm,
    handleValidate,
    handleUnvalidate,
  };
}
