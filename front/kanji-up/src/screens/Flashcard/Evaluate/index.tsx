import React, {useCallback, useEffect, useRef} from 'react';
import {Platform, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import {useDispatch, useSelector} from 'react-redux';
import {AxiosResponse} from 'axios';

import styles from '../style';
import Sketch from '../../../components/Sketch';
import colors from '../../../constants/colors';
import {RootState} from '../../../store';
import {error, evaluation} from '../../../store/slices';
import {uploadImage} from '../../../service/file';

const timeMax = 30;

export default function Evaluate({ kanji, model, onFinish }: { kanji: KanjiType[], model: any, onFinish: Function }) {
  const i = 0;
  const dispatch = useDispatch();
  const canvasRef = useRef<any>();
  const progressCircleRef = useRef<any>();
  const evaluationState = useSelector((state: RootState) => state.evaluation);
  const [timer, setTimer] = React.useState<number>(timeMax);
  const [kanjiQueue, setKanjiQueue] = React.useState<KanjiType[] | null>(null);
  const [start, setStart] = React.useState<boolean>(false);

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
      }

      // Dispatch score
      const prediction: PredictionType[] = await model.predict(imageBase64);
      const isIncluded = prediction.some((p) => p.prediction === details.character);

      if (!isIncluded) {
        dispatch(evaluation.actions.addAnswer({ kanji: details.character as string, image: imageBase64, answer: [], status: 'toReview', message: 'The drawing kanji seems not be recognized by our algo' }));
      }

      try {
        const recognition = await uploadImage(canvasRef, details.character as string, prediction) as AxiosResponse<RecognitionType>;

        dispatch(evaluation.actions.addAnswer({ kanji: recognition.data.kanji || '', image: recognition.data.image, answer: prediction, status: 'correct', message: 'Correct !' }));

      } catch (err) {
        console.error(err);
      }

      setKanjiQueue((prev) => prev?.slice(1) || prev);
      // next card
      if (Platform.OS === 'web') {
        setTimer(timeMax);
      } else {
        if (progressCircleRef?.current) {
          progressCircleRef.current.reAnimate();
        }
      }
    }
  }, [model, kanjiQueue, canvasRef, progressCircleRef, evaluation]);

  useEffect(() => {
    setKanjiQueue(kanji.sort(() => 0.5 - Math.random()));
  }, [kanji]);

  useEffect(() => {
    if (dispatch) {
      if (kanjiQueue && kanjiQueue.length > 0 && !start) {
        dispatch(evaluation.actions.initialize());
        setStart(true);
      }
      if (start && kanjiQueue && kanjiQueue.length < 1) {
        onFinish({ title: 'Completed', content: `You have completed a set of ${kanji.length} card` });
        dispatch(evaluation.actions.finish());
      }
    }
  }, [dispatch, kanjiQueue, start]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      let interval:number = timeMax;
      if (timer !== 0) {
        interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
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
          maxValue={timeMax}
          initialValue={timeMax}
          activeStrokeWidth={15}
          activeStrokeColor={colors.primary}
          activeStrokeSecondaryColor={'#C25AFF'}
          inActiveStrokeWidth={15}
          duration={timeMax * 1000}
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

