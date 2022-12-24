import React, {useRef} from 'react';
import {useSelector} from 'react-redux';
import {Platform, Text, View} from 'react-native';
import {Button, ProgressBar, Surface} from 'react-native-paper';
import CircularProgress from 'react-native-circular-progress-indicator';

import useHandlers from './useHandlers';
import styles from '../style';
import {RootState} from '../../../store';
import Sketch from '../../../components/Sketch';
import {colors} from '../../../constants';

export default function Evaluate({ kanji, model, onFinish }: { kanji: Partial<KanjiType>[], model: any, onFinish: Function }) {
  const i = 0;
  const canvasRef = useRef<any>();
  const progressCircleRef = useRef<any>();
  const settingsState = useSelector((state: RootState) => state.settings);
  const { counter, kanjiQueue, timer, handleValidate, handleClear } = useHandlers({
    model, kanji, canvasRef, progressCircleRef, onFinish,
  });

  if (!kanjiQueue || (kanjiQueue && kanjiQueue.length < 1) || counter >= settingsState.evaluationCardNumber) { return null; }

  return (<View style={[styles.content, { marginTop: 0 }]}>
    <Surface style={styles.surface}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.subtext}>Progression</Text>
        <Text style={styles.subtext}>{counter}/{settingsState.evaluationCardNumber}</Text>
      </View>
      <ProgressBar progress={counter/settingsState.evaluationCardNumber} style={{backgroundColor: '#fff', marginTop: 10, borderRadius: 25 }} color={colors.secondary} />
    </Surface>
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
        <Text style={styles.text}>on: {kanjiQueue[i].kanji!.onyomi}</Text>
        <Text style={styles.text}>kun: {kanjiQueue[i].kanji!.kunyomi}</Text>
        <Text style={styles.text}>mean: {kanjiQueue[i].kanji!.meaning}</Text>
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
