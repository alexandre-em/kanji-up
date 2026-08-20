import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../hooks/useThemedStyles';

// Shared between the live evaluation result screen and the read-only session history detail
// screen — just the row/icon presentation, not either screen's own container chrome
export function useResultRowStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.$outlineNeutral,
      },
      thumbnail: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: Colors.$backgroundNeutralLight,
      },
      thumbnailPlaceholder: {
        backgroundColor: Colors.$backgroundGeneralLight,
      },
      rowContent: {
        flex: 1,
        gap: 2,
      },
      rowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      statusIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );
}
