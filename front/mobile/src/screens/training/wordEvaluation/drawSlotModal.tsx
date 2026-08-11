import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Button, Colors, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import Close from '../../../components/svg/close';
import { CANVAS_WIDTH } from '../../../constants/styles';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import WordSlotCanvas, { WordSlotCanvasHandle } from './wordSlotCanvas';

const { Dialog } = Incubator;

type DrawSlotModalProps = {
  visible: boolean;
  /** Only a fresh, never-drawn slot can chain into another one — editing an existing drawing has
   * nothing to "add" after it */
  canAddAnother: boolean;
  onClose: () => void;
  onDone: (image: string | null, strokesCount: number) => void;
  onDoneAndContinue: (image: string | null, strokesCount: number) => void;
  /** Only set when editing an already-drawn slot — a fresh slot has nothing to delete yet, closing
   * it (the X) already discards it */
  onDelete?: () => void;
};

export default function DrawSlotModal({
  visible,
  canAddAnother,
  onClose,
  onDone,
  onDoneAndContinue,
  onDelete,
}: DrawSlotModalProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<WordSlotCanvasHandle>(null);
  const styles = useThemedStyles(() =>
    StyleSheet.create({
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
    }),
  );

  const submit = async () => {
    const strokesCount = canvasRef.current?.getStrokesCount() ?? 0;

    if (!canvasRef.current || strokesCount === 0) {
      return { image: null, strokesCount: 0 };
    }

    const image = await canvasRef.current.capture();
    return { image, strokesCount };
  };

  const handleDone = async () => {
    const { image, strokesCount } = await submit();
    onDone(image, strokesCount);
  };

  const handleDoneAndContinue = async () => {
    const { image, strokesCount } = await submit();
    onDoneAndContinue(image, strokesCount);
    // The dialog stays open for the next kanji: only the canvas needs resetting
    canvasRef.current?.clear();
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
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel={t('wordEvaluation.drawModal.close')}>
            <Close size={26} color={Colors.$iconNeutral} />
          </TouchableOpacity>
        </RNView>
        <RNView style={styles.canvasWrapper}>{visible && <WordSlotCanvas ref={canvasRef} size={CANVAS_WIDTH} />}</RNView>
        {canAddAnother && <Button label={t('wordEvaluation.drawModal.next')} onPress={handleDoneAndContinue} />}
        <Button label={t('wordEvaluation.drawModal.done')} onPress={handleDone} outline={canAddAnother} />
        {onDelete && <Button label={t('wordEvaluation.drawModal.delete')} onPress={onDelete} outline />}
      </RNView>
    </Dialog>
  );
}
