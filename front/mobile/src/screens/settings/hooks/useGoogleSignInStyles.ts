import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../hooks/useThemedStyles';

export function useGoogleSignInStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.$backgroundPrimaryHeavy,
      },
      linkedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.$backgroundNeutralLight,
      },
    }),
  );
}
