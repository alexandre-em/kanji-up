import React from 'react';
import { GestureResponderEvent, Text, TouchableOpacity } from 'react-native';
import { ProgressBar, Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { KanjiType } from 'kanji-app-types';

import styles from '../style';
import { RootState } from 'store';
import { KANJI_PROGRESSION_MAX, colors } from 'constants';

export default function KanjiSurface({ kanji, onPress }: { kanji: KanjiType; onPress?: (e: GestureResponderEvent) => void }) {
  const kanjiState = useSelector((s: RootState) => s.kanji);

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
    <TouchableOpacity key={kanji.kanji?.character_id} onPress={onPress}>
      <Surface style={[styles.kanjiSurface, surfaceStyle(kanji.kanji_id)]} elevation={1}>
        <Text style={styles.kanjiText}>{kanji.kanji?.character}</Text>
      </Surface>
      {kanjiState.progression[kanji.kanji_id] !== undefined && (
        <ProgressBar
          style={{ width: 60, alignSelf: 'center' }}
          progress={kanjiState.progression[kanji.kanji_id] / KANJI_PROGRESSION_MAX}
        />
      )}
    </TouchableOpacity>
  );
}
