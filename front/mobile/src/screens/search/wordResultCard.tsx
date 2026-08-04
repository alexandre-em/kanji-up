import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

type WordResultCardProps = {
  word: WordType;
  onPress: () => void;
};

export default function WordResultCard({ word, onPress }: WordResultCardProps) {
  const spelling = word.word.join(', ');
  const reading = word.reading.join(', ');
  const meaning = word.definition[0]?.meaning.join(', ');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button">
      <RNView style={styles.cardInfo}>
        <Text text80BL numberOfLines={1}>
          {spelling}
        </Text>
        <Text text90M $textNeutral numberOfLines={1}>
          {reading}
        </Text>
        {meaning && (
          <Text text90M $textDefault numberOfLines={2}>
            {meaning}
          </Text>
        )}
      </RNView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.$outlineNeutral,
  },
  cardInfo: {
    gap: 2,
  },
});
