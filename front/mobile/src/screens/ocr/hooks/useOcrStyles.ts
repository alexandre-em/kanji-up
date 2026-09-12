import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../hooks/useThemedStyles';

export function useOcrStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: Colors.$backgroundDefault,
      },
      listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
      },
      banner: {
        alignItems: 'center',
      },
      center: {
        alignItems: 'center',
        paddingVertical: 40,
      },
      tokenRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
      },
      token: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
      },
      tokenMatched: {
        backgroundColor: Colors.$backgroundPrimaryLight,
      },
      historyRow: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.$outlineNeutral,
      },
      historyThumbnail: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: Colors.$backgroundNeutralLight,
      },
      resultImage: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        backgroundColor: Colors.$backgroundNeutralLight,
      },
      historyContent: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
      },
      footer: {
        paddingVertical: 16,
        alignItems: 'center',
      },
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
    }),
  );
}
