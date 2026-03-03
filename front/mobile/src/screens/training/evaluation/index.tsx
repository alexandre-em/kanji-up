import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';

import Layout from '../../../components/layout.tsx';
import { CANVAS_HEIGHT, CANVAS_WIDTH, MODEL_IMAGE_HEIGHT, MODEL_IMAGE_WIDTH } from '../../../constants/styles.ts';
import Canvas from '../../../components/canvas.tsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Image, View } from 'react-native-ui-lib';
import Spacing from '../../../components/spacing.tsx';

export default function EvaluationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const viewShotRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [source, setSource] = useState<string>();

  const onCapture = useCallback(() => {
    setIsCapturing(true);
  }, []);

  useEffect(() => {
    if (viewShotRef.current && isCapturing) {
      viewShotRef.current
        .capture()
        .then((uri: string) => setSource(uri))
        .finally(() => {
          setIsCapturing(false);
          canvasRef.current?.clear();
        });
    }
  }, [isCapturing]);

  useEffect(() => {
    if (source) {
      console.log('source', source);
    }
  }, [source]);

  console.log({ source });

  return (
    <Layout screen="evaluation">
      <View centerH>
        <ViewShot
          ref={viewShotRef}
          style={styles.viewShot}
          options={{ result: 'data-uri', format: 'jpg', width: MODEL_IMAGE_WIDTH, height: MODEL_IMAGE_HEIGHT }}>
          <Canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            hideGuides={isCapturing}
            hideBorder={isCapturing}
            hideClearButton={isCapturing}
          />
        </ViewShot>
      </View>
      <Spacing y={20} />
      <Button label="Next" onPress={onCapture} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
  },
  transparent: { backgroundColor: '#00000000' },
  badge: { position: 'absolute', right: 10, top: 10 },
  viewShot: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
});
