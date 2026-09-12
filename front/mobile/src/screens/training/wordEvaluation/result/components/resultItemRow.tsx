import { TouchableOpacity, View as RNView } from 'react-native';
import { Text } from 'react-native-ui-lib';

import { WordEvaluationItemType } from '../../../../../store/slices/wordEvaluation';
import { useItemMessage } from '../hooks/useItemMessage';
import { useResultStyles } from '../hooks/useResultStyles';
import StatusIcon from './statusIcon';

type ResultItemRowProps = {
  item: WordEvaluationItemType;
  /** Only 'review' answers are interactive: tapping one opens the review modal on it. Omit for a
   * read-only view (e.g. session history) — even a 'review' item then just displays as-is. */
  onPress?: () => void;
};

export default function ResultItemRow({ item, onPress }: ResultItemRowProps) {
  const styles = useResultStyles();
  const message = useItemMessage(item);
  const wordText = item.word.word?.[0] ?? '';
  const meaning = item.word.definition?.[0]?.meaning?.join(', ');

  const content = (
    <>
      <RNView style={styles.wordBox}>
        <Text text40BL $textDefault>
          {wordText}
        </Text>
      </RNView>
      <RNView style={styles.rowContent}>
        <RNView style={styles.rowHeader}>
          <Text text80M $textDefault numberOfLines={1} style={styles.meaning}>
            {meaning}
          </Text>
          <StatusIcon item={item} />
        </RNView>
        <Text text90M $textDefault numberOfLines={2}>
          {message}
        </Text>
      </RNView>
    </>
  );

  if (!onPress) return <RNView style={styles.row}>{content}</RNView>;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={message}>
      {content}
    </TouchableOpacity>
  );
}
