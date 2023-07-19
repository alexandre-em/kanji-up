import React, { useCallback, useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { Button, Divider, ProgressBar, Surface, TouchableRipple } from 'react-native-paper';
import { useSelector } from 'react-redux';

import styles from '../style';
import SvgUriPlatform from '../../../components/SVGUriPlatform';
import { colors } from '../../../constants';
import { RootState } from '../../../store';

export default function Practice({ kanji, onFinish }: { kanji: Partial<KanjiType>[]; onFinish: Function }) {
  const i = 0;
  const { width } = useWindowDimensions();
  const [start, setStart] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [reverse, setReverse] = useState<boolean>(false);
  const [kanjiQueue, setKanjiQueue] = useState<Partial<KanjiType>[] | null>(null);
  const settingsState = useSelector((state: RootState) => state.settings);

  const imgSize = useMemo(() => Math.min(width * 0.7, 500), [width]);

  const cardContent = useMemo(() => {
    if (!kanjiQueue || (kanjiQueue && !kanjiQueue[i])) return null;
    if (reverse) {
      return (
        <View style={{ padding: 30, justifyContent: 'center', height: '100%' }}>
          <Text style={{ color: colors.primary, fontSize: 30, fontWeight: '900', alignSelf: 'center' }}>{kanjiQueue[i].kanji!.character}</Text>
          <Text style={styles.text}>on: {kanjiQueue[i].kanji!.onyomi}</Text>
          <Text style={styles.text}>kun: {kanjiQueue[i].kanji!.kunyomi}</Text>
          <Text style={styles.text}>meaning: {kanjiQueue[i].kanji!.meaning}</Text>
          <Divider style={{ marginVertical: 15, width: '80%', alignSelf: 'center' }} />
          <Text style={styles.text}>Examples</Text>
          {kanjiQueue[i].examples &&
            kanjiQueue[i].examples
              .map((k) => (
                <View key={k.japanese}>
                  <Text style={{ fontWeight: '100', color: colors.text }}>{k.japanese}</Text>
                  <Text style={{ fontWeight: '100', color: colors.text }}>{k.meaning}</Text>
                </View>
              ))
              .filter((_, index) => index < 3)}
        </View>
      );
    }

    // TODO: Check if svg is available and if not display text
    return <SvgUriPlatform width={imgSize} height={imgSize} uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(kanjiQueue[i].kanji!.character as string)}`} />;
  }, [imgSize, kanjiQueue, reverse]);

  const handleReverse = useCallback(() => {
    setReverse((p) => !p);
  }, []);

  const handleNext = useCallback(() => {
    setKanjiQueue((prev) => prev && prev.slice(1));
    setCounter((prev) => prev + 1);
  }, []);

  React.useEffect(() => {
    setKanjiQueue(kanji.sort(() => 0.5 - Math.random()));
  }, [kanji]);

  React.useEffect(() => {
    if (kanjiQueue && kanjiQueue.length > 0 && !start) {
      setStart(true);
    }

    const isLimitReached = counter >= settingsState.flashcardNumber;

    if (start && kanjiQueue && (kanjiQueue.length < 1 || isLimitReached)) {
      if (!isLimitReached) {
        setKanjiQueue(kanji.sort(() => 0.5 - Math.random()));
      } else {
        onFinish({ title: 'Completed', content: `You have completed a set of ${counter} card` });
      }
    }
  }, [kanjiQueue, start, counter]);

  return (
    <View style={styles.content}>
      <Surface style={styles.surface}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.subtext}>Progression</Text>
          <Text style={styles.subtext}>
            {counter}/{settingsState.flashcardNumber}
          </Text>
        </View>
        <ProgressBar progress={counter / settingsState.flashcardNumber} style={{ backgroundColor: '#fff', marginTop: 10, borderRadius: 25 }} color={colors.secondary} />
      </Surface>
      <TouchableRipple style={{ width: imgSize, height: imgSize, alignSelf: 'center' }} onPress={handleReverse}>
        <Surface style={{ width: imgSize, height: imgSize }}>{cardContent}</Surface>
      </TouchableRipple>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button mode="outlined" icon="reload" color={colors.primary} style={styles.clearbutton} onPress={handleReverse}>
          Reverse
        </Button>
        <Button mode="contained" icon="checkbox-marked-circle-outline" color={colors.primary} style={styles.clearbutton} onPress={handleNext}>
          Next
        </Button>
      </View>
    </View>
  );
}
