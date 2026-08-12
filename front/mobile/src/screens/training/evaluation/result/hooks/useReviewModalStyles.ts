import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { useThemedStyles } from '../../../../../hooks/useThemedStyles';

const CANVAS_PREVIEW_SIZE = 180;

export function useReviewModalStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      container: {
        padding: 20,
        gap: 20,
        backgroundColor: Colors.$backgroundDefault,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      compare: {
        flexDirection: 'row',
        gap: 16,
      },
      compareItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
      },
      drawing: {
        width: CANVAS_PREVIEW_SIZE,
        height: CANVAS_PREVIEW_SIZE,
        borderRadius: 12,
        backgroundColor: Colors.$backgroundNeutralLight,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.$outlineNeutral,
      },
      expectedBox: {
        width: CANVAS_PREVIEW_SIZE,
        height: CANVAS_PREVIEW_SIZE,
        borderRadius: 12,
        backgroundColor: Colors.$backgroundNeutralLight,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.$outlineNeutral,
        alignItems: 'center',
        justifyContent: 'center',
      },
      expectedCharacter: {
        fontSize: 96,
        color: Colors.$textDefault,
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
