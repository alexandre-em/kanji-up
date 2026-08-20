import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../../hooks/useThemedStyles';

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
      stickyBar: {
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.$outlineNeutral,
      },
    }),
  );
}
