import { predict } from '@kanjiup/recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Image, View } from 'react-native-ui-lib';
import ViewShot from 'react-native-view-shot';

import Canvas from '../../../components/canvas.tsx';
import Layout from '../../../components/layout.tsx';
import Spacing from '../../../components/spacing.tsx';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../constants/styles.ts';

export default function EvaluationScreen() {
  const { t } = useTranslation();
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
      predict(source)
        .then((res) => {
          console.log('predicted', res);
        })
        .catch((err) => {
          console.error('Catched error', err);
        });
    }
  }, [source]);

  return (
    <Layout screen="evaluation">
      <View centerH>
        <ViewShot ref={viewShotRef} style={styles.viewShot} options={{ result: 'base64' }}>
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
      <Image source={{ uri: 'data:image/png;base64,' + source }} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
  },
  // transparent: { backgroundColor: '#00000000' },
  badge: { position: 'absolute', right: 10, top: 10 },
  viewShot: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
});
