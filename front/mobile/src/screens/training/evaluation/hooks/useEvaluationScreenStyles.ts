import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../../constants/styles';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export function useEvaluationScreenStyles() {
  return useThemedStyles(() =>
    StyleSheet.create({
      yomi: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      timer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      progressBar: {
        height: 8,
      },
      viewShot: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      },
      canvasContainer: {
        position: 'relative',
      },
      savingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.$backgroundDefault,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
      },
    }),
  );
}
