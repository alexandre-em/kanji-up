import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../hooks/useThemedStyles';

export function useScanDetailStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      image: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        backgroundColor: Colors.$backgroundNeutralLight,
      },
      translationRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: 6,
      },
    }),
  );
}
