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
      // Matches $backgroundDefault (not $backgroundNeutralLight) on purpose: ExpandableSection
      // wraps its sectionHeader in its own internal RNUI View, which we can't style — and every
      // unstyled RNUI View defaults to $backgroundDefault (see the global ThemeManager override in
      // config/rnui.ts). A different card fill would show through as a mismatched patch behind the
      // header text. The border alone defines the card's edge.
      card: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
        backgroundColor: Colors.$backgroundDefault,
        padding: 16,
      },
      cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      cardHeaderText: {
        flex: 1,
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
