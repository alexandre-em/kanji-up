import { StyleSheet } from 'react-native';

import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useFlashcardsScreenStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      progressBar: {
        height: 8,
        borderRadius: 4,
      },
      actions: {
        flexDirection: 'row',
        gap: 12,
      },
      actionButton: {
        flex: 1,
      },
    }),
  );
}
