import React, {useCallback, useEffect, useRef} from 'react';
import {Platform, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';
import {useDispatch, useSelector} from 'react-redux';
import {AxiosResponse} from 'axios';
import * as FileSystem from 'expo-file-system';

import styles from '../style';
import Sketch from '../../../components/Sketch';
import colors from '../../../constants/colors';
import {RootState} from '../../../store';
import {error, evaluation} from '../../../store/slices';
import {recognitionService} from '../../../service';

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

      // Dispatch score
      const imageBase64: string = canvasRef.current.getUri();
      const prediction = await model.predict(imageBase64);

      try {
        const recognition: AxiosResponse<RecognitionType> = await new Promise((resolve, reject) => {
          canvasRef.current.toBlob((blob: Blob) => {
            recognitionService.postRecognition(details.character as string, prediction, blob)
              .then(resolve)
              .catch(reject);
          });
        });
        dispatch(evaluation.actions.addAnswer({ kanji: recognition.data.kanji || '', image: recognition.data.image, answer: prediction }));

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

  const handleValidateNative = useCallback(async () => {
    if (canvasRef?.current && kanjiQueue) {
      const isValid = canvasRef?.current.strokeCount === kanjiQueue[i].kanji.strokes;
      const details = kanjiQueue[i].kanji;

      // Dispatch score
      const imageBase64: string = await canvasRef.current.getUri();
      const imageBase64Code = imageBase64.split('data:image/jpeg;base64,')[1];
      const prediction = await model.predict(imageBase64Code);
      const filename = `${FileSystem.documentDirectory}${Date.now().toString()}.jpg`;
      await FileSystem.writeAsStringAsync(filename, imageBase64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      try {
        const recognition: AxiosResponse<RecognitionType> = await recognitionService.postRecognitionNative(details.character as string, prediction, filename);

        dispatch(evaluation.actions.addAnswer({ kanji: recognition.data.kanji || '', image: recognition.data.image, answer: prediction }));

        await FileSystem.deleteAsync(filename);
      } catch (err) {
        console.error(err);
      }
      setKanjiQueue((prev) => prev?.slice(1) || prev);
      // next card
      if (progressCircleRef?.current) {
        progressCircleRef.current.reAnimate();
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
          onAnimationComplete={handleValidateNative}
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
      <Button mode="contained" icon="checkbox-marked-circle-outline" color={colors.primary} style={styles.clearbutton} onPress={Platform.OS === 'web' ? handleValidate : handleValidateNative}>
        Validate
      </Button>
    </View>
  </View>
)
};

