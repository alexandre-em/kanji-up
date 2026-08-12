import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useFlashcardStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      card: {
        minHeight: 280,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
        backgroundColor: Colors.$backgroundNeutralLight,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      },
      character: {
        fontSize: 96,
      },
      hint: {
        marginTop: 8,
      },
    }),
  );
}
