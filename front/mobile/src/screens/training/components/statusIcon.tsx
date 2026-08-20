import { View as RNView } from 'react-native';
import { Assets, Colors, Icon, Text } from 'react-native-ui-lib';

import { EvaluationItemType, getEffectiveStatus } from '../../../store/slices/evaluation';
import { useResultRowStyles } from '../hooks/useResultRowStyles';

export default function StatusIcon({ item }: { item: EvaluationItemType }) {
  const styles = useResultRowStyles();
  const effectiveStatus = getEffectiveStatus(item);

  if (effectiveStatus === 'correct') {
    return (
      <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundSuccessLight }]}>
        <Icon source={Assets.icons.check} size={16} tintColor={Colors.$iconSuccess} />
      </RNView>
    );
  }

  if (effectiveStatus === 'incorrect') {
    return (
      <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundPrimaryLight }]}>
        <Icon source={Assets.icons.cross} size={16} tintColor={Colors.$iconPrimary} />
      </RNView>
    );
  }

  // Never attempted (idle) — visually distinct from 'review''s "?": a dash, not a question mark,
  // since there's no judgment call to make on a kanji that was never even drawn
  if (effectiveStatus === 'idle') {
    return (
      <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundNeutralLight }]}>
        <Text text80BO $textNeutral>
          –
        </Text>
      </RNView>
    );
  }

  return (
    <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundWarningLight }]}>
      <Text text80BO $textWarning>
        ?
      </Text>
    </RNView>
  );
}
