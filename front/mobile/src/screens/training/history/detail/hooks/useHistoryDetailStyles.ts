import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../../hooks/useThemedStyles';

export function useHistoryDetailStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      divider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.$outlineNeutral,
      },
    }),
  );
}
