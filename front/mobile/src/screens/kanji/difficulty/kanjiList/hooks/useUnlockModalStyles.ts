import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../../hooks/useThemedStyles';

export function useUnlockModalStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      modal: {
        backgroundColor: Colors.$backgroundDefault,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
      },
      actions: {
        flexDirection: 'row',
        gap: 10,
      },
      button: {
        flex: 1,
      },
    }),
  );
}
