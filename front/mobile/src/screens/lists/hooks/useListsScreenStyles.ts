import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../hooks/useThemedStyles';

export function useListsScreenStyles() {
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
      card: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
        backgroundColor: Colors.$backgroundNeutralLight,
        padding: 16,
      },
      cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      cardActions: {
        flexDirection: 'row',
        gap: 12,
      },
      chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      },
      chip: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: Colors.$backgroundNeutralMedium,
      },
      // Same chip, but sized to fit a multi-character word instead of a single kanji glyph
      wordChip: {
        minWidth: 40,
        height: 40,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: Colors.$backgroundNeutralMedium,
      },
      createButton: {
        alignSelf: 'flex-start',
      },
      empty: {
        paddingVertical: 40,
        alignItems: 'center',
      },
      modalContent: {
        padding: 20,
      },
    }),
  );
}
