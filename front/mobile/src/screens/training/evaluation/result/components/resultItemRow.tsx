import { Image, TouchableOpacity, View as RNView } from 'react-native';
import { Text } from 'react-native-ui-lib';

import { EvaluationItemType } from '../../../../../store/slices/evaluation';
import { useItemMessage } from '../hooks/useItemMessage';
import { useResultStyles } from '../hooks/useResultStyles';
import StatusIcon from './statusIcon';

type ResultItemRowProps = {
  item: EvaluationItemType;
  /** Only 'review' answers are interactive: tapping one opens the review modal on it */
  onPress?: () => void;
};

export default function ResultItemRow({ item, onPress }: ResultItemRowProps) {
  const styles = useResultStyles();
  const message = useItemMessage(item);

  const content = (
    <>
      {item.image ? (
        <Image source={{ uri: `data:image/png;base64,${item.image}` }} style={styles.thumbnail} />
      ) : (
        <RNView style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}
      <RNView style={styles.rowContent}>
        <RNView style={styles.rowHeader}>
          <Text text40BL $textDefault>
            {item.kanji.kanji?.character}
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
