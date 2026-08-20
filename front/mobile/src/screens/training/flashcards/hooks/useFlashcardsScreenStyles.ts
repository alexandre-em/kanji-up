import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useFlashcardsScreenStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      segmentedControl: {
        flexDirection: 'row',
        padding: 4,
        gap: 4,
        borderRadius: 25,
        backgroundColor: Colors.$backgroundNeutralMedium,
      },
      segment: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
      },
      segmentActive: {
        backgroundColor: Colors.$backgroundPrimaryHeavy,
      },
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
