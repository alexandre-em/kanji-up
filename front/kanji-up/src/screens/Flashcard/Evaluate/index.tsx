import React, {useCallback, useRef} from 'react';
import {Platform, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';

import styles from '../style';
import Sketch from '../../../components/Sketch';
import colors from '../../../constants/colors';

const timeMax = 30;

export default function Evaluate({ kanji }: { kanji: KanjiType[] }) {
  const [timer, setTimer] = React.useState<number>(timeMax);
  const canvasRef = useRef<any>();
  const progressCircleRef = useRef<any>();
  const i = 0;

  const handleClear = useCallback(() => {
    if (canvasRef && canvasRef.current) {
      canvasRef.current.handleClear();
    }
  }, [canvasRef]);

  const handleValidate = useCallback(() => {
    if (canvasRef?.current && kanji) {
      const isValid = canvasRef?.current.strokeCount === kanji[i].kanji.strokes;
      const details = kanji[i].kanji;

      // Dispatch score


      // next card
      if (Platform.OS === 'web') {
        setTimer(timeMax);
      } else {
        if (progressCircleRef?.current) {
          progressCircleRef.current.reAnimate();
        }
      }
    }
  }, [kanji, canvasRef, progressCircleRef]);

  React.useEffect(() => {
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
        <Text style={styles.text}>on: {kanji[i].kanji.onyomi}</Text>
        <Text style={styles.text}>kun: {kanji[i].kanji.kunyomi}</Text>
        <Text style={styles.text}>mean: {kanji[i].kanji.meaning}</Text>
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

