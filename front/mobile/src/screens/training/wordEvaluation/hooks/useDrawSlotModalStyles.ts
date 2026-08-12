import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useDrawSlotModalStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      container: {
        padding: 20,
        gap: 20,
        backgroundColor: Colors.$backgroundDefault,
        borderRadius: 20,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      canvasWrapper: {
        alignItems: 'center',
      },
    }),
  );
}
