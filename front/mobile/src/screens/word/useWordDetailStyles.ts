import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../hooks/useThemedStyles';

export function useWordDetailStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      },
      masteryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.$backgroundPrimaryLight,
      },
      kanjiTile: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
      },
      definitionRow: {
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.$outlineNeutral,
      },
      exampleRow: {
        marginTop: 6,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: Colors.$outlineNeutral,
        gap: 2,
      },
    }),
  );
}
