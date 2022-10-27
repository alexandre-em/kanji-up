import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, Platform, ScrollView, Text, View} from 'react-native';
import {Button, Divider, IconButton, List} from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import {useDispatch, useSelector} from 'react-redux';
import {AxiosResponse} from 'axios';

import styles from '../style';
import Sketch from '../../../components/Sketch';
import colors from '../../../constants/colors';
import {RootState} from '../../../store';
import {evaluation} from '../../../store/slices';
import {uploadImage} from '../../../service/file';

export default function Evaluate({ kanji, model, onFinish }: { kanji: Partial<KanjiType>[], model: any, onFinish: Function }) {
  const i = 0;
  const dispatch = useDispatch();
  const canvasRef = useRef<any>();
  const progressCircleRef = useRef<any>();
  const evaluationState = useSelector((state: RootState) => state.evaluation);
  const settingsState = useSelector((state: RootState) => state.settings);
  const [timer, setTimer] = useState<number>(settingsState.evaluationTime || 60);
  const [kanjiQueue, setKanjiQueue] = useState<KanjiType[] | null>(null);
  const [start, setStart] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);

  const handleClear = useCallback(() => {
    if (canvasRef && canvasRef.current) {
      canvasRef.current.handleClear();
    }
  }, [canvasRef]);

  const handleValidate = useCallback(async () => {
    if (canvasRef?.current && kanjiQueue) {
      const isValid = canvasRef?.current.strokeCount === kanjiQueue[i].kanji.strokes;
      const details = kanjiQueue[i].kanji;
      const imageBase64: string = Platform.OS === 'web'
        ? canvasRef.current.getUri()
        : (await canvasRef.current.getUri()).split('data:image/jpeg;base64,')[1];

      if (!isValid) {
        dispatch(evaluation.actions.addAnswer({ kanji: details.character as string, image: imageBase64, answer: [], status: 'incorrect', message: 'The stroke number does\'t match' }));
      } else {

        // Dispatch score
        const prediction: PredictionType[] = await model.predict(imageBase64);
        const isIncluded = prediction.some((p) => p.prediction === details.character);

        if (!isIncluded) {
          dispatch(evaluation.actions.addAnswer({ kanji: details.character as string, image: imageBase64, answer: [], status: 'toReview', message: 'The answer and the drawed kanji seems not match, please confirm' }));
        } else {

          try {
            const recognition = await uploadImage(canvasRef, details.character as string, prediction) as AxiosResponse<RecognitionType>;

            dispatch(evaluation.actions.addAnswer({ kanji: recognition.data.kanji || '', image: recognition.data.image, answer: prediction, status: 'correct', message: 'Correct !' }));

          } catch (err) {
            console.error(err);
          }
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
    }
  }, [model, kanjiQueue, canvasRef, progressCircleRef, evaluation, settingsState]);

  const handleConfirm = useCallback((id: number, ans?: AnswerType) => {
    dispatch(evaluation.actions.updateAnswerStatus({ id, status: 'correct', message: 'This answer has been validated by the user' }));
    // TODO: upload image base64
  }, [dispatch]);

  const handleUnvalidate = useCallback((id: number) => {
    dispatch(evaluation.actions.updateAnswerStatus({ id, status: 'incorrect', message: 'This answer has been unvalidated by the user' }));
  }, [dispatch]);

  const results = useMemo(() => {
    return (<ScrollView>
      {evaluationState.answers.map((a, i) => {
        return (
          <View key={`result-${i}`}>
            <List.Item
              title={`Answer was ${a.kanji}`}
              titleStyle={{ fontWeight: '700', color: colors.primary }}
              description={a.message}
              left={() => <Image source={{ uri: a.image }} style={{ width: 30, height: 30 }} />}
              right={(props) => (a.status === 'toReview' &&
                <View {...props} style={{ flexDirection: 'row' }}>
                  <IconButton icon="checkbox-marked-circle-outline" color="#bdf56e" onPress={() => handleConfirm(i) } />
                  <IconButton icon="close-circle-outline" color={colors.primaryDark} onPress={() => handleUnvalidate(i) } />
                </View>
              )}
            />
            {i < evaluationState.answers.length - 1 && <Divider />}
          </View>
        )
      })}
    </ScrollView>)
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
      if (start && kanjiQueue && (kanjiQueue.length < 1 || isLimitReached)) {
        if (!isLimitReached) {
          setKanjiQueue(kanji.sort(() => 0.5 - Math.random()));
        } else {
          if (evaluationState.status !== 'done' && evaluationState.status !== 'error') {
            dispatch(evaluation.actions.finish());
          }
        }
      }
    }
  }, [dispatch, kanjiQueue, start, results, evaluationState, kanji, settingsState, counter]);

  useEffect(() => {
    if (evaluationState.status === 'done' || evaluationState.status === 'error') {
      onFinish({ title: 'Completed', content: `You have completed a set of ${counter} card`, component: results });
    }
  },[evaluationState, settingsState, counter])

  useEffect(() => {
    if (Platform.OS === 'web') {
      let interval:number = settingsState.evaluationTime;
      if (timer > 0) {
        interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      } else {
        handleValidate();
      }

      return () => {
        clearInterval(interval)
      }
    }
  }, [timer]);

  if (!kanjiQueue || (kanjiQueue && kanjiQueue.length < 1)) { return null; }

  return (<View style={styles.content}>
    <View style={styles.contentHeader}>
      {Platform.OS === 'web'
        ? <View style={styles.timer}><Text style={{ fontSize: 20, color: colors.primary, fontWeight: '700' }}>{timer}</Text></View>
        : <CircularProgress
          value={0}
          radius={40}
          maxValue={settingsState.evaluationTime || 60}
          initialValue={settingsState.evaluationTime || 60}
          activeStrokeWidth={15}
          activeStrokeColor={colors.primary}
          activeStrokeSecondaryColor={'#C25AFF'}
          inActiveStrokeWidth={15}
          duration={(settingsState.evaluationTime || 60) * 1000}
          onAnimationComplete={handleValidate}
          ref={progressCircleRef}
        />
      }
      <View style={{ justifyContent: 'center', marginLeft: 30 }}>
        <Text style={styles.text}>on: {kanjiQueue[i].kanji.onyomi}</Text>
        <Text style={styles.text}>kun: {kanjiQueue[i].kanji.kunyomi}</Text>
        <Text style={styles.text}>mean: {kanjiQueue[i].kanji.meaning}</Text>
      </View>
    </View>
    <Sketch visible ref={canvasRef} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <Button mode="outlined" icon="eraser-variant" color={colors.primary} style={styles.clearbutton} onPress={handleClear}>
        Clear
      </Button>
      <Button mode="contained" icon="checkbox-marked-circle-outline" color={colors.primary} style={styles.clearbutton} onPress={handleValidate}>
        Validate
      </Button>
    </View>
  </View>
)
};

