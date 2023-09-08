import { router } from 'expo-router';
import { Image, Platform, Text } from 'react-native';
import { List } from 'react-native-paper';
import { SvgUri } from 'react-native-svg';
import { useSelector } from 'react-redux';

import { KanjiType } from 'kanji-app-types';

import { RootState } from 'store';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { KANJI_PROGRESSION_MAX, colors } from 'constants';

export default function RandomKanji() {
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const userState = useSelector((state: RootState) => state.user);

  if (kanjiState.selectedKanji && Object.keys(kanjiState.selectedKanji).length > 0) {
    const kanjiKeys: Array<string> = Object.keys(kanjiState.selectedKanji);
    const random: number = Math.floor(Math.random() * kanjiKeys.length);
    const choosenKanji: Partial<KanjiType> = kanjiState.selectedKanji[kanjiKeys[random]];

    const icon = (props: any) => {
      if (choosenKanji.kanji?.character) {
        if (Platform.OS === 'web') {
          return (
            <Image
              {...props}
              style={{ width: 32, height: 32 }}
              source={{ uri: `https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}` }}
            />
          );
        }
        return (
          <SvgUri
            width={32}
            height={32}
            uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}`}
          />
        );
      }
      return null;
    };

    return (
      <List.Item
        title={choosenKanji.kanji?.meaning}
        description="See details"
        left={icon}
        right={() => (
          <AnimatedCircularProgress
            size={40}
            width={7}
            fill={((userState.progression[choosenKanji.kanji_id!] || 0) / KANJI_PROGRESSION_MAX) * 100}
            tintColor={colors.primary}
            backgroundColor={colors.primary + '75'}>
            {() => (
              <Text style={{ color: colors.text, fontWeight: '900' }}>
                {((userState.progression[choosenKanji.kanji_id!] || 0) / KANJI_PROGRESSION_MAX) * 100}
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
