import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../hooks/useThemedStyles';

export function useResultStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: Colors.$backgroundDefault,
      },
      summary: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        gap: 4,
      },
      list: {
        flex: 1,
      },
      listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
      },
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
      stickyBar: {
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.$outlineNeutral,
      },
    }),
  );
}
