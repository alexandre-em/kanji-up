import { router } from 'expo-router';
import { Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { List } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { SVGUriPlatform } from 'kanji-app-svg-ui';
import { KanjiType } from 'kanji-app-types';

import { RootState } from '../../../store';
import { KANJI_PROGRESSION_MAX, colors, endpointUrls } from '../../../constants';

export default function RandomKanji() {
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const userState = useSelector((state: RootState) => state.user);

  if (kanjiState.selectedKanji && Object.keys(kanjiState.selectedKanji).length > 0) {
    const kanjiKeys: Array<string> = Object.keys(kanjiState.selectedKanji);
    const random: number = Math.floor(Math.random() * kanjiKeys.length);
    const choosenKanji: Partial<KanjiType> = kanjiState.selectedKanji[kanjiKeys[random]];

    return (
      <List.Item
        title={choosenKanji.kanji?.meaning}
        description="See details"
        left={() => (
          <SVGUriPlatform
            width={32}
            height={32}
            uri={`${endpointUrls.kanji}/kanjis/image/${encodeURIComponent(choosenKanji.kanji?.character || '')}`}
            alt={choosenKanji.kanji?.character}
          />
        )}
        right={() => (
          <AnimatedCircularProgress
            size={40}
            width={7}
            fill={((userState.progression[choosenKanji.kanji_id!] || 0) / KANJI_PROGRESSION_MAX) * 100}
            tintColor={colors.primary}
            backgroundColor={colors.primary + '75'}>
            {() => (
              <Text style={{ color: colors.text, fontWeight: '900' }}>
                {Math.min(((userState.progression[choosenKanji.kanji_id!] || 0) / KANJI_PROGRESSION_MAX) * 100, 100)}
              </Text>
            )}
          </AnimatedCircularProgress>
        )}
        onPress={() => router.push(`/kanji/${choosenKanji.kanji_id}`)}
        style={{ marginHorizontal: 20 }}
      />
    );
  }

  return null;
}
