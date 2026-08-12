import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useDraggableSlotRowStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      scroll: {
        flexGrow: 0,
      },
      content: {
        position: 'relative',
      },
      slotWrapper: {
        position: 'relative',
      },
      slot: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
        backgroundColor: Colors.$backgroundNeutralLight,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      },
      slotImage: {
        borderRadius: 14,
      },
      slotBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        paddingHorizontal: 6,
        backgroundColor: Colors.$backgroundPrimaryHeavy,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      },
      addSlot: {
        position: 'absolute',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.$outlinePrimary,
        borderStyle: 'dashed',
        backgroundColor: Colors.$backgroundPrimaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  );
}
