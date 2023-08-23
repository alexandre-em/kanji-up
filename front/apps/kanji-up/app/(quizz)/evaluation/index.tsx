import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import Sketch from 'kanji-app-sketch';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useKanjiAppAuth } from 'kanji-app-auth';

import { useQuizzContext } from '../_layout';
import styles from '../style';
import { RootState } from 'store';
import { colors } from 'constants/Colors';
import { error, evaluation } from 'store/slices';
import { uploadImage } from 'services/file';
import { router } from 'expo-router';

export default function Evaluate() {
  const dispatch = useDispatch();
  const QuizzContext = useQuizzContext();
  const AuthContext = useKanjiAppAuth();
  const canvasRef = useRef<any>();
  const progressCircleRef = useRef<any>();
  const settingsState = useSelector((state: RootState) => state.settings);
  const [counter, setCounter] = useState<number>(0);
  const [timer, setTimer] = useState<number>(settingsState.evaluationTime || 60);

  const kanjiQueue = useMemo(() => {
    if (QuizzContext.kanjis) {
      const kanjis = QuizzContext.kanjis;

      return Array.from(Array(settingsState.evaluationCardNumber).keys()).map(
        () => kanjis[Math.floor(Math.random() * kanjis.length)]
      );
    }
    return [];
  }, [QuizzContext.kanjis, settingsState.evaluationCardNumber]);

  const handleClear = useCallback(() => {
    if (canvasRef && canvasRef.current) {
      canvasRef.current.handleClear();
    }
  }, [canvasRef]);

  const handleValidate = useCallback(async () => {
    if (canvasRef?.current && kanjiQueue) {
      const strokeCount = canvasRef?.current.strokeCount;
      const isValid = strokeCount === kanjiQueue[counter].kanji?.strokes;
      const details = kanjiQueue[counter].kanji;
      const imageBase64: string =
        Platform.OS === 'web'
          ? canvasRef.current.getUri()
          : (await canvasRef.current.getUri()).split('data:image/jpeg;base64,')[1];
      const imageBase64WFormat = Platform.OS === 'web' ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
      let predictFunction;

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
        // if (settingsState.useLocalModel) {
        //   predictFunction = ModelContext?.models.recognition.predict(imageBase64);
        // } else {
        predictFunction = uploadImage(canvasRef, details!.character as string, {
          headers: { Authorization: `Bearer ${AuthContext.token}` },
        });
        // }

        predictFunction
          .then((prediction: any) => {
            const predictedKanji = prediction.find((p: any) => p.prediction === details!.character);

            dispatch(
              evaluation.actions.addAnswer({
                kanji: details!.character as string,
                recognitionId: `${counter}`,
                image: imageBase64WFormat,
                answer: prediction,
                status: !predictedKanji ? 'toReview' : 'correct',
                message: !predictedKanji ? 'The drawed kanji seems incorrect, please confirm' : 'Correct answer !',
              })
            );
            if (predictedKanji) {
              const grade = kanjiQueue[counter].reference?.grade;
              dispatch(
                evaluation.actions.addPoints(
                  Math.max(predictedKanji.score * 100 * (grade === 'custom' ? 8 : parseInt(grade || '1', 10)), 10)
                )
              );
            }
          })
          .catch((err: any) => {
            dispatch(error.actions.update({ message: err.message }));
          });
      }

      handleClear();
      // setKanjiQueue((prev) => prev?.slice(1) || prev);
      setCounter((prev) => prev + 1);
      // next card
      if (Platform.OS === 'web' && settingsState) {
        setTimer(settingsState.evaluationTime);
      } else {
        progressCircleRef?.current?.reAnimate();
      }
    }
  }, [kanjiQueue, canvasRef, progressCircleRef, evaluation, settingsState, counter]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      let interval;
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

  useEffect(() => {
    if (counter && counter >= settingsState.evaluationCardNumber) {
      router.push('/modal');
    }
  }, [counter]);

  if (kanjiQueue.length <= counter || !kanjiQueue[counter]) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={[styles.content, { marginTop: 0 }]}>
      <View style={styles.contentHeader}>
        <AnimatedCircularProgress
          size={75}
          width={10}
          fill={(timer / settingsState.evaluationTime) * 100}
          tintColor={colors.primary}
          backgroundColor={colors.primary + '75'}>
          {() => <Text style={{ color: colors.text, fontWeight: '900' }}>{timer}</Text>}
        </AnimatedCircularProgress>
        <View style={{ justifyContent: 'center', marginLeft: 30 }}>
          <Text style={[styles.text, { color: colors.primary, fontWeight: 'bold' }]}>
            Card: {counter + 1} / {settingsState.evaluationCardNumber}
          </Text>
          <Text style={styles.text}>on: {kanjiQueue[counter].kanji!.onyomi}</Text>
          <Text style={styles.text}>kun: {kanjiQueue[counter].kanji!.kunyomi}</Text>
          <Text style={styles.text}>mean: {kanjiQueue[counter].kanji!.meaning}</Text>
        </View>
      </View>

      <Sketch visible color={colors.text} ref={canvasRef} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button mode="outlined" icon="eraser-variant" style={styles.clearbutton} onPress={handleClear}>
          Clear
        </Button>
        <Button
          mode="contained"
          icon="checkbox-marked-circle-outline"
          style={styles.clearbutton}
          onPress={() => handleValidate()}>
          Validate
        </Button>
      </View>
    </View>
  );
}
