import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useWordEvaluationStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      screenContent: {
        flex: 1,
      },
      spacer: {
        flex: 1,
      },
      hintCard: {
        backgroundColor: Colors.$backgroundNeutralLight,
        borderRadius: 16,
        padding: 20,
      },
      hintSentence: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        rowGap: 8,
      },
      hintBlank: {
        alignItems: 'center',
        marginHorizontal: 4,
      },
      hintReading: {
        fontSize: 11,
        color: Colors.$textNeutral,
        marginBottom: 2,
      },
      hintChip: {
        height: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.$outlineNeutral,
        backgroundColor: Colors.$backgroundDefault,
      },
      progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      progressBadge: {
        backgroundColor: Colors.$backgroundPrimaryLight,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
      },
      progressBar: {
        height: 8,
        borderRadius: 4,
      },
    }),
  );
}
