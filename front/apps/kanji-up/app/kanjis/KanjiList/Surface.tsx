import React from 'react';
import { GestureResponderEvent, Text, Pressable } from 'react-native';
import { ProgressBar, Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { KanjiType } from 'kanji-app-types';

import styles from '../style';
import { KANJI_PROGRESSION_MAX, colors } from '../../../constants';
import { RootState } from '../../../store';

export default function KanjiSurface({ kanji, onPress }: { kanji: KanjiType; onPress?: (e: GestureResponderEvent) => void }) {
  const kanjiState = useSelector((s: RootState) => s.kanji);
  const userState = useSelector((s: RootState) => s.user);

  const surfaceStyle = React.useCallback(
    (kanjiId: string) => {
      if (kanjiState.toRemove[kanjiId]) {
        return { backgroundColor: colors.warning, color: '#fff' };
      }
      if (kanjiState.toAdd[kanjiId]) {
        return { backgroundColor: colors.info, color: '#fff' };
      }
      if (kanjiState.selectedKanji[kanjiId]) {
        return { backgroundColor: '#ebebeb', color: '#fff' };
      }
      return {};
    },
    [kanjiState]
  );

  return (
    <Pressable key={kanji.kanji?.character_id} onPress={onPress}>
      <Surface style={[styles.kanjiSurface, surfaceStyle(kanji.kanji_id)]} elevation={1}>
        <Text style={styles.kanjiText}>{kanji.kanji?.character}</Text>
      </Surface>
      {userState.progression[kanji.kanji_id] !== undefined && (
        <ProgressBar
          style={{ width: 60, alignSelf: 'center' }}
          progress={userState.progression[kanji.kanji_id] / KANJI_PROGRESSION_MAX}
          color={(userState.progression[kanji.kanji_id] / KANJI_PROGRESSION_MAX) * 100 < 100 ? colors.secondary : colors.success}
        />
      )}
    </Pressable>
  );
}
