import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View as RNView } from 'react-native';
import { Button, Colors, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import { EvaluationItemType } from '../../../store/slices/evaluation';

const { Dialog } = Incubator;

type ReviewModalProps = {
  item: EvaluationItemType | undefined;
  /** 1-based position among all 'review' answers, for the "2 / 6" counter */
  position: number;
  total: number;
  onChoose: (isCorrect: boolean) => void;
  onClose: () => void;
};

export default function ReviewModal({ item, position, total, onChoose, onClose }: ReviewModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog visible={!!item} onDismiss={onClose} useSafeArea bottom width="100%">
      {item && (
        <RNView style={styles.container}>
          <RNView style={styles.header}>
            <Text text70BO>{t('evaluationResult.review.title')}</Text>
            <Text text80M $textGeneral>
              {position} / {total}
            </Text>
          </RNView>
          <RNView style={styles.compare}>
            <RNView style={styles.compareItem}>
              <Text text90M $textGeneral>
                {t('evaluationResult.review.yourDrawing')}
              </Text>
              {/* A 'review' answer always carries an image: judging a drawing means seeing it */}
              <Image source={{ uri: `data:image/png;base64,${item.image}` }} style={styles.drawing} />
            </RNView>
            <RNView style={styles.compareItem}>
              <Text text90M $textGeneral>
                {t('evaluationResult.review.expected')}
              </Text>
              <RNView style={styles.expectedBox}>
                <Text style={styles.expectedCharacter}>{item.kanji.kanji?.character}</Text>
              </RNView>
            </RNView>
          </RNView>
          <Text text70M center>
            {t('evaluationResult.review.question')}
          </Text>
          <RNView style={styles.actions}>
            <Button label={t('evaluationResult.review.no')} outline onPress={() => onChoose(false)} style={styles.actionButton} />
            <Button label={t('evaluationResult.review.yes')} onPress={() => onChoose(true)} style={styles.actionButton} />
          </RNView>
        </RNView>
      )}
    </Dialog>
  );
}

const CANVAS_PREVIEW_SIZE = 180;

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.$outlineNeutral,
  },
  expectedBox: {
    width: CANVAS_PREVIEW_SIZE,
    height: CANVAS_PREVIEW_SIZE,
    borderRadius: 12,
    backgroundColor: '#fff',
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
});
