import { predict } from '@kanjiup/recognition';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Assets, Button, Chip, Colors, Icon, ProgressBar, Text, View } from 'react-native-ui-lib';
import ViewShot from 'react-native-view-shot';

import Canvas from '../../../components/canvas.tsx';
import Layout from '../../../components/layout.tsx';
import Spacing from '../../../components/spacing.tsx';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../constants/styles.ts';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { selectCurrentIndex, selectEvaluationItems, updateItemScore } from '../../../store/slices/evaluation';

const TIMER_DURATION = 60;

export default function EvaluationScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector(selectCurrentIndex);
  const evaluationItems = useAppSelector(selectEvaluationItems);
  const viewShotRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [strokesCount, setStrokesCount] = useState(0);
  const [timer, setTimer] = useState<number>(TIMER_DURATION);
  const toast = useToaster();

  const currentKanji = useMemo(() => {
    return evaluationItems[currentIndex];
  }, [evaluationItems, currentIndex]);

  // Every answer has been saved: there is no item left to time nor to score
  const isSessionOver = currentIndex >= evaluationItems.length;

  const onCapture = useCallback(() => {
    setIsCapturing(true);
  }, []);

  const onPredict = useCallback(
    (uri: string) => {
      if (uri) {
        predict(uri)
          .then((res: PredictionType[]) => {
            console.log('predicted', res);
            // The drawing is kept: the user needs to see it again to arbitrate a doubtful answer
            dispatch(updateItemScore({ result: res, strokesCount, image: uri }));
            toast?.show({ message: 'Answer saved', type: 'success' });
          })
          .catch((err) => {
            console.error('Catched error', err);
            toast?.show({ message: 'An error occurred when saving the answer', type: 'failure' });
          })
          .finally(() => {
            setTimer(TIMER_DURATION);
          });
      }
    },
    [dispatch, toast, strokesCount],
  );

  const timerInMinutes = useMemo(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [timer]);

  // Timer use effect
  useEffect(() => {
    if (isSessionOver) return;

    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      // No image: the drawing was never submitted, so the answer cannot be arbitrated
      dispatch(updateItemScore({ result: [], strokesCount, image: null }));
      setTimer(TIMER_DURATION);
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, dispatch, isSessionOver]);

  useEffect(() => {
    if (isCapturing) {
      if (viewShotRef.current) {
        viewShotRef.current
          .capture()
          .then((uri: string) => {
            onPredict(uri);
          })
          .finally(() => {
            setIsCapturing(false);
            canvasRef.current?.clear();
          });
      }
    }
  }, [isCapturing, onPredict]);

  return (
    <Layout screen="evaluation">
      <View flex height="100%" spread>
        <View centerH>
          <View width="100%">
            <RNView style={styles.progressHeader}>
              <Text text70BL>Session progress</Text>
              <Text text80BL $textPrimary>
                {currentIndex + 1} / {evaluationItems.length}
              </Text>
            </RNView>
            <ProgressBar progress={((currentIndex + 1) / evaluationItems.length) * 100} fullWidth style={styles.progressBar} />
          </View>
          <Spacing y={20} />
          <RNView style={styles.timer}>
            <Icon source={Assets.icons.timer} size={20} tintColor={Colors.$textPrimary} />
            <Spacing x={5} />
            <Text text50BO $textPrimary>
              {timerInMinutes}
            </Text>
          </RNView>
          <Spacing y={10} />
          <Text h1>{currentKanji?.kanji?.kanji?.meaning?.join(', ')}</Text>
          <Spacing y={20} />
          <RNView style={styles.yomi}>
            <Chip label={'ON'} />
            <Spacing x={10} />
            <Text h4 $textNeutralHeavy>
              {currentKanji?.kanji?.kanji?.onyomi?.join(', ')}
            </Text>
          </RNView>
          <Spacing y={5} />
          <RNView style={styles.yomi}>
            <Chip label={'KUN'} />
            <Spacing x={10} />
            <Text h4 $textNeutralHeavy>
              {currentKanji?.kanji?.kanji?.kunyomi?.join(', ')}
            </Text>
          </RNView>
        </View>
        <View centerH>
          <ViewShot ref={viewShotRef} style={styles.viewShot} options={{ result: 'base64' }}>
            <Canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              hideGuides={isCapturing}
              hideBorder={isCapturing}
              hideClearButton={isCapturing}
              onStrokeUpdate={setStrokesCount}
            />
          </ViewShot>
          <Spacing y={5} />
          <Text text70BL $textPrimary>
            Strokes : {strokesCount}
          </Text>
        </View>
        {/* <Spacing y={20} /> */}
        <Button label="Validate" onPress={onCapture} disabled={isSessionOver} />
      </View>
      {/* <Image source={{ uri: 'data:image/png;base64,' + source }} /> */}
    </Layout>
  );
}

const styles = StyleSheet.create({
  yomi: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
  },
  // transparent: { backgroundColor: '#00000000' },
  viewShot: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
});
