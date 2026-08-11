import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Assets, Button, Colors, Icon, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import { CANVAS_WIDTH } from '../../../constants/styles';
import WordSlotCanvas, { WordSlotCanvasHandle } from './wordSlotCanvas';

const { Dialog } = Incubator;

type DrawSlotModalProps = {
  visible: boolean;
  onClose: () => void;
  onDone: (image: string | null, strokesCount: number) => void;
};

export default function DrawSlotModal({ visible, onClose, onDone }: DrawSlotModalProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<WordSlotCanvasHandle>(null);

  const handleDone = async () => {
    const strokesCount = canvasRef.current?.getStrokesCount() ?? 0;

    if (!canvasRef.current || strokesCount === 0) {
      onDone(null, 0);
      return;
    }

    const image = await canvasRef.current.capture();
    onDone(image, strokesCount);
  };

  return (
    <Dialog
      visible={visible}
      onDismiss={onClose}
      useSafeArea
      centerH
      centerV
      width="90%"
      // RNUI's Dialog memoizes its own background without a theme dependency, so it can freeze
      // on whichever scheme was active at first mount — this forces it fresh on every render
      containerStyle={{ backgroundColor: Colors.$backgroundDefault }}>
      <RNView style={styles.container}>
        <RNView style={styles.header}>
          <Text text70BO $textDefault>
            {t('wordEvaluation.drawModal.title')}
          </Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel={t('wordEvaluation.drawModal.close')}>
            <Icon source={Assets.icons.cross} size={18} tintColor={Colors.$iconNeutral} />
          </TouchableOpacity>
        </RNView>
        <RNView style={styles.canvasWrapper}>{visible && <WordSlotCanvas ref={canvasRef} size={CANVAS_WIDTH} />}</RNView>
        <Button label={t('wordEvaluation.drawModal.done')} onPress={handleDone} />
      </RNView>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    backgroundColor: Colors.$backgroundDefault,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  canvasWrapper: {
    alignItems: 'center',
  },
});
