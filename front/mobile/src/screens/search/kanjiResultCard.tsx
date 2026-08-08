import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import DifficultyTag, { getGradeTag, getJlptTag } from './difficultyTag';

type KanjiResultCardProps = {
  kanji: Partial<KanjiType>;
  onPress: () => void;
};

export default function KanjiResultCard({ kanji, onPress }: KanjiResultCardProps) {
  const { t } = useTranslation();
  const readings = [...(kanji.kanji?.onyomi ?? []), ...(kanji.kanji?.kunyomi ?? [])].join(', ');
  const meaning = kanji.kanji?.meaning?.join(', ');
  const gradeTag = getGradeTag(kanji.reference?.grade, t);
  const jlptTag = getJlptTag(kanji.kanji?.jlpt, t);

  return (
    <TouchableOpacity
      style={[styles.card, { borderBottomColor: Colors.$outlineNeutral }]}
      onPress={onPress}
      accessibilityRole="button">
      <RNView style={[styles.characterBox, { backgroundColor: Colors.$backgroundNeutralLight }]}>
        <Text style={[styles.characterText, { color: Colors.$textDefault }]}>{kanji.kanji?.character}</Text>
      </RNView>
      <RNView style={styles.cardInfo}>
        <Text text80BL $textDefault numberOfLines={1}>
          {readings}
        </Text>
        <Text text90M $textNeutral numberOfLines={2}>
          {meaning}
        </Text>
        {(gradeTag || jlptTag) && (
          <RNView style={styles.tagRow}>
            {jlptTag && <DifficultyTag tag={jlptTag} />}
            {gradeTag && <DifficultyTag tag={gradeTag} />}
          </RNView>
        )}
      </RNView>
    </TouchableOpacity>
  );
}

const CHARACTER_BOX_SIZE = 64;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  characterBox: {
    width: CHARACTER_BOX_SIZE,
    height: CHARACTER_BOX_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterText: {
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
});
