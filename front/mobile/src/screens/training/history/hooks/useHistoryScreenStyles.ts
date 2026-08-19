import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useHistoryScreenStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      segmentedControl: {
        flexDirection: 'row',
        padding: 4,
        gap: 4,
        borderRadius: 25,
        backgroundColor: Colors.$backgroundNeutralMedium,
      },
      segment: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
      },
      segmentActive: {
        backgroundColor: Colors.$backgroundPrimaryHeavy,
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.$outlineNeutral,
      },
      empty: {
        paddingVertical: 40,
        alignItems: 'center',
      },
      footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
      },
    }),
  );
}
