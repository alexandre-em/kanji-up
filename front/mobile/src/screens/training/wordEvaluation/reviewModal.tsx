import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, View as RNView } from 'react-native';
import { Button, Colors, Text } from 'react-native-ui-lib';
import Incubator from 'react-native-ui-lib/incubator';

import { getKanjiCharacters, WordEvaluationItemType } from '../../../store/slices/wordEvaluation';

const { Dialog } = Incubator;

type WordReviewModalProps = {
  item: WordEvaluationItemType | undefined;
  position: number;
  total: number;
  onChoose: (isCorrect: boolean) => void;
  onClose: () => void;
};

export default function WordReviewModal({ item, position, total, onChoose, onClose }: WordReviewModalProps) {
  const { t } = useTranslation();
  const expectedCharacters = item ? getKanjiCharacters(item.word.word?.[0] ?? '') : [];

  return (
    <Dialog visible={!!item} onDismiss={onClose} useSafeArea bottom width="100%">
      {item && (
        <RNView style={styles.container}>
          <RNView style={styles.header}>
            <Text text70BO>{t('wordEvaluationResult.review.title')}</Text>
            <Text text80M $textGeneral>
              {position} / {total}
            </Text>
          </RNView>
          <ScrollView style={styles.pairs} contentContainerStyle={styles.pairsContent}>
            {expectedCharacters.map((character, index) => {
              const slot = item.slots[index];
              return (
                <RNView key={index} style={styles.compare}>
                  <RNView style={styles.compareItem}>
                    <Text text90M $textGeneral>
                      {t('wordEvaluationResult.review.yourDrawing')}
                    </Text>
                    {slot?.image ? (
                      <Image source={{ uri: `data:image/png;base64,${slot.image}` }} style={styles.drawing} />
                    ) : (
                      <RNView style={[styles.drawing, styles.thumbnailPlaceholder]} />
                    )}
                  </RNView>
                  <RNView style={styles.compareItem}>
                    <Text text90M $textGeneral>
                      {t('wordEvaluationResult.review.expected')}
                    </Text>
                    <RNView style={styles.expectedBox}>
                      <Text style={styles.expectedCharacter}>{character}</Text>
                    </RNView>
                  </RNView>
                </RNView>
              );
            })}
          </ScrollView>
          <Text text70M center>
            {t('wordEvaluationResult.review.question')}
          </Text>
          <RNView style={styles.actions}>
            <Button
              label={t('wordEvaluationResult.review.no')}
              outline
              onPress={() => onChoose(false)}
              style={styles.actionButton}
            />
            <Button label={t('wordEvaluationResult.review.yes')} onPress={() => onChoose(true)} style={styles.actionButton} />
          </RNView>
        </RNView>
      )}
    </Dialog>
  );
}

const CANVAS_PREVIEW_SIZE = 130;

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
  pairs: {
    maxHeight: 320,
  },
  pairsContent: {
    gap: 16,
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
  thumbnailPlaceholder: {
    backgroundColor: Colors.$backgroundNeutralLight,
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
    fontSize: 72,
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
