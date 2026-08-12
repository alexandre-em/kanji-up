import { Dimensions, StyleSheet, View as RNView } from 'react-native';
import { Colors, Text } from 'react-native-ui-lib';

import { GENERAL_MARGIN } from '../../../constants/styles';

const { width } = Dimensions.get('window');

export default function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <RNView style={[styles.statCard, { borderColor: Colors.$outlineNeutral }]}>
      <Text text50BL $textDefault>
        {value}
      </Text>
      <Text text90M $textGeneral>
        {label}
      </Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  statCard: {
    width: (width - GENERAL_MARGIN * 2 - 20) / 3,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
