import { router } from 'expo-router';
import { Image, Platform } from 'react-native';
import { List } from 'react-native-paper';
import { SvgUri } from 'react-native-svg';
import { useSelector } from 'react-redux';

import { KanjiType } from 'kanji-app-types';

import { RootState } from '../../../store';

export default function RandomKanji() {
  const kanjiState = useSelector((state: RootState) => state.kanji);

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
        onPress={() => router.push(`/kanji/${choosenKanji.kanji_id as string}`)}
        style={{ marginHorizontal: 20 }}
      />
    );
  }

  return null;
}
