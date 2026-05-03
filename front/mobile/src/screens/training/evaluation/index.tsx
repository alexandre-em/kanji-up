import { predict } from '@kanjiup/recognition';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Button, Chip, ProgressBar, Text, View } from 'react-native-ui-lib';
import ViewShot from 'react-native-view-shot';

import Canvas from '../../../components/canvas.tsx';
import Layout from '../../../components/layout.tsx';
import Spacing from '../../../components/spacing.tsx';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../constants/styles.ts';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { selectCurrentIndex, selectEvaluationItems, updateItemScore } from '../../../store/slices/evaluation';

export default function EvaluationScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector(selectCurrentIndex);
  const evaluationItems = useAppSelector(selectEvaluationItems);
  const viewShotRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [strokesCount, setStrokesCount] = useState(0);
  const [source, setSource] = useState<string>();
  const toast = useToaster();

  const currentKanji = useMemo(() => {
    return evaluationItems[currentIndex];
  }, [evaluationItems, currentIndex]);

  const onCapture = useCallback(() => {
    setIsCapturing(true);
  }, []);

  useEffect(() => {
    if (isCapturing) {
      if (viewShotRef.current) {
        viewShotRef.current
          .capture()
          .then((uri: string) => {
            setSource(uri);
          })
          .finally(() => {
            setIsCapturing(false);
            canvasRef.current?.clear();
          });
      }
    }
  }, [isCapturing]);

  useEffect(() => {
    if (source) {
      predict(source)
        .then((res: PredictionType[]) => {
          console.log('predicted', res);
          dispatch(updateItemScore({ result: res, strokesCount }));
          toast?.show({ message: 'Answer saved', type: 'success' });
        })
        .catch((err) => {
          console.error('Catched error', err);
          toast?.show({ message: 'An error occurred when saving the answer', type: 'failure' });
        });
    }
  }, [source, dispatch, toast, strokesCount]);

  return (
    <Layout screen="evaluation">
      <View flex height="100%" spread>
        <View centerH>
          <ProgressBar progress={50} fullWidth />
          <Text h1>{currentKanji.kanji?.kanji?.meaning?.join(', ')}</Text>
          <Spacing y={20} />
          <RNView style={styles.yomi}>
            <Chip label={'ON'} />
            <Spacing x={10} />
            <Text h4 $textNeutralHeavy>
              {currentKanji.kanji?.kanji?.onyomi?.join(', ')}
            </Text>
          </RNView>
          <Spacing y={5} />
          <RNView style={styles.yomi}>
            <Chip label={'KUN'} />
            <Spacing x={10} />
            <Text h4 $textNeutralHeavy>
              {currentKanji.kanji?.kanji?.kunyomi?.join(', ')}
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
        </View>
        {/* <Spacing y={20} /> */}
        <Button label="Next" onPress={onCapture} />
      </View>
      {/* <Image source={{ uri: 'data:image/png;base64,' + source }} /> */}
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
  },
  yomi: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // transparent: { backgroundColor: '#00000000' },
  badge: { position: 'absolute', right: 10, top: 10 },
  viewShot: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
});
