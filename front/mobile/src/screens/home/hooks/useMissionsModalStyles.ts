import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../hooks/useThemedStyles';

export function useMissionsModalStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      modal: {
        backgroundColor: Colors.$backgroundDefault,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
      },
      taskIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.$outlineNeutral,
        alignItems: 'center',
        justifyContent: 'center',
      },
      taskIconDone: {
        backgroundColor: Colors.$backgroundSuccessLight,
        borderColor: Colors.$backgroundSuccessLight,
      },
      taskLabel: {
        flex: 1,
      },
    }),
  );
}
