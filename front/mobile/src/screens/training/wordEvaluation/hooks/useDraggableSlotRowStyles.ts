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
      // The slot currently bound to the on-screen canvas — a thicker primary-colored border is
      // the only reliable way to show this at a glance across every slot size (compact word rows
      // shrink tiles down enough that a background tint alone would be easy to miss)
      slotActive: {
        borderWidth: 3,
        borderColor: Colors.$outlinePrimary,
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
      // Mirrors slotBadge's position on the opposite corner — deleting a drawing is independent
      // of making it active, so it needs its own always-reachable target rather than living behind
      // an "activate first, then delete" detour
      deleteBadge: {
        position: 'absolute',
        top: -8,
        left: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.$backgroundNeutralHeavy,
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
      // A fresh, not-yet-drawn slot has no thumbnail of its own to highlight — the "+" tile stands
      // in for it, switching to a solid fill so it reads as "this is what the canvas is bound to"
      // rather than "tap to add another"
      addSlotActive: {
        borderStyle: 'solid',
        borderWidth: 3,
        backgroundColor: Colors.$backgroundPrimaryMedium,
      },
    }),
  );
}
