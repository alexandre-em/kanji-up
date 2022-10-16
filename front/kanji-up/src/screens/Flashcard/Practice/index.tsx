import React, {useCallback, useMemo} from 'react';
import {Text, useWindowDimensions, View} from 'react-native';
import {Button, Divider, Surface} from 'react-native-paper';
import SvgUriPlatform from '../../../components/SVGUriPlatform';

import colors from '../../../constants/colors';
import styles from '../style';

export default function Practice({ kanji, onFinish }: { kanji: KanjiType[], onFinish: Function }) {
  const i = 0;
  const { width } = useWindowDimensions();
  const [reverse, setReverse] = React.useState<boolean>(false);
  const [kanjiQueue, setKanjiQueue] = React.useState<KanjiType[] | null>(null);

  const imgSize = useMemo(() => Math.min(width * 0.7, 500), [width]);

  const cardContent = useMemo(() => {
    if (!kanjiQueue || (kanjiQueue && !kanjiQueue[i])) return null;
    if (reverse) {
      return (
        <View style={{ padding: 30, justifyContent: 'center', height: '100%' }}>
          <Text style={{ color: colors.primary, fontSize: 30, fontWeight: '900', alignSelf: 'center' }}>{kanjiQueue[i].kanji.character}</Text>
          <Text style={styles.text}>on: {kanjiQueue[i].kanji.onyomi}</Text>
          <Text style={styles.text}>kun: {kanjiQueue[i].kanji.kunyomi}</Text>
          <Text style={styles.text}>meaning: {kanjiQueue[i].kanji.meaning}</Text>
          <Divider style={{ marginVertical: 15, width: '80%', alignSelf: 'center' }} />
          <Text style={styles.text}>Examples</Text>
        {kanjiQueue[i]?.examples && kanjiQueue[i].examples.map((k) => (
          <View key={k.japanese}>
            <Text style={{ fontWeight: '100', color: colors.text }}>{k.japanese}</Text>
            <Text style={{ fontWeight: '100', color: colors.text }}>{k.meaning}</Text>

          </View>
      )).filter((_, i) => i < 3)}
    </View>
  )
    }

    return <SvgUriPlatform width={imgSize} height={imgSize} uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(kanjiQueue[i].kanji.character as string)}`} />
    }, [imgSize, kanjiQueue, reverse]);

  const handleReverse = useCallback(() => {
    setReverse(p => !p);
  }, []);

  const handleNext = useCallback(() => {
    setKanjiQueue((prev) => prev.slice(1));
  }, []);

  React.useEffect(() => {
    setKanjiQueue(kanji.sort(() => 0.5 - Math.random()));
  }, [kanji]);

  React.useEffect(() => {
    if (kanjiQueue && kanjiQueue.length < 1) { onFinish(); }
  }, [kanjiQueue]);

  return (
    <View style={styles.content}>
      <Surface style={{ width: imgSize, height: imgSize, alignSelf: 'center' }}>
        {cardContent}
      </Surface>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button mode="outlined" icon="eraser-variant" color={colors.primary} style={styles.clearbutton} onPress={handleReverse}>
          Reverse
        </Button>
        <Button mode="contained" icon="checkbox-marked-circle-outline" color={colors.primary} style={styles.clearbutton} onPress={handleNext}>
          Next
        </Button>
      </View>
    </View>
  );
}
