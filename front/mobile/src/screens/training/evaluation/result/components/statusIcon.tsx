import { View as RNView } from 'react-native';
import { Assets, Colors, Icon, Text } from 'react-native-ui-lib';

import { EvaluationItemType, getEffectiveStatus } from '../../../../../store/slices/evaluation';
import { useResultStyles } from '../hooks/useResultStyles';

export default function StatusIcon({ item }: { item: EvaluationItemType }) {
  const styles = useResultStyles();
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

  return (
    <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundWarningLight }]}>
      <Text text80BO $textWarning>
        ?
      </Text>
    </RNView>
  );
}
