import { predict } from '@kanjiup/recognition';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Assets, Button, Chip, Colors, Icon, ProgressBar, Text, View } from 'react-native-ui-lib';
import ViewShot from 'react-native-view-shot';

import Canvas from '../../../components/canvas.tsx';
import Layout from '../../../components/layout.tsx';
import Spacing from '../../../components/spacing.tsx';
import { RECOGNITION_MODEL_LABELS } from '../../../constants/recognitionLabels.ts';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../constants/styles.ts';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useIsOffline } from '../../../providers/network';
import { useToaster } from '../../../providers/toaster';
import { selectCurrentIndex, selectEvaluationItems, updateItemScore } from '../../../store/slices/evaluation';
import EvaluationResult from './result.tsx';

const TIMER_DURATION = 60;

export default function EvaluationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isOffline = useIsOffline();
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
        const character = currentKanji?.kanji?.kanji?.character;

        // The model only classifies into the fixed set it was trained on — calling predict() for
        // a character outside that set can only ever misclassify. Passing no predictions routes
        // this to the existing 'review' status (updateItemScore), same as a doubtful answer the
        // model failed to recognize: the user arbitrates it themselves on the result screen.
        if (character && !RECOGNITION_MODEL_LABELS.has(character)) {
          dispatch(updateItemScore({ result: [], strokesCount, image: uri }));
          toast?.show({ message: 'Answer saved', type: 'success' });
          setTimer(TIMER_DURATION);
          return;
        }

        predict(uri)
          .then((res: PredictionType[]) => {
            // The drawing is kept: the user needs to see it again to arbitrate a doubtful answer
            dispatch(updateItemScore({ result: res, strokesCount, image: uri }));
            toast?.show({ message: 'Answer saved', type: 'success' });
          })
          .catch(() => {
            toast?.show({ message: 'An error occurred when saving the answer', type: 'failure' });
          })
          .finally(() => {
            setTimer(TIMER_DURATION);
          });
      }
    },
    [dispatch, toast, strokesCount, currentKanji],
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

  // The result view replaces the quiz in place (see the render below): hide the header's back
  // arrow once there, so leaving is only possible through the result screen's own validate flow
  useEffect(() => {
    if (isSessionOver) navigation.setOptions({ headerShown: false });
  }, [isSessionOver, navigation]);

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

  // Same route as the quiz (see EvaluationHoc): no separate screen to navigate to, so there is
  // no "back into the quiz" state for the Android back button to return to
  if (isSessionOver) return <EvaluationResult />;

  return (
    <Layout screen="evaluation">
      <View flex height="100%" spread>
        <View centerH>
          <View width="100%">
            <RNView style={styles.progressHeader}>
              <Text text70BL $textDefault>
                Session progress
              </Text>
              <Text text80BL $textPrimary>
                {currentIndex + 1} / {evaluationItems.length}
              </Text>
            </RNView>
            <ProgressBar progress={((currentIndex + 1) / evaluationItems.length) * 100} fullWidth style={styles.progressBar} />
          </View>
          {isOffline && (
            <>
              <Spacing y={10} />
              <Text text90M $textWarning center>
                {t('evaluation.offline.notice')}
              </Text>
            </>
          )}
          <Spacing y={20} />
          <RNView style={styles.timer}>
            <Icon source={Assets.icons.timer} size={20} tintColor={Colors.$textPrimary} />
            <Spacing x={5} />
            <Text text50BO $textPrimary>
              {timerInMinutes}
            </Text>
          </RNView>
          <Spacing y={10} />
          <Text h1 $textDefault>
            {currentKanji?.kanji?.kanji?.meaning?.join(', ')}
          </Text>
          <Spacing y={20} />
          <RNView style={styles.yomi}>
            <Chip label={'ON'} />
            <Spacing x={10} />
            <Text h4 $textDefault>
              {currentKanji?.kanji?.kanji?.onyomi?.join(', ')}
            </Text>
          </RNView>
          <Spacing y={5} />
          <RNView style={styles.yomi}>
            <Chip label={'KUN'} />
            <Spacing x={10} />
            <Text h4 $textDefault>
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
              forceCaptureColors={isCapturing}
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
