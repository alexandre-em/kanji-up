import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Assets, Button, Colors, Icon, Text, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import {
  EvaluationItemType,
  getEffectiveStatus,
  selectCorrectCount,
  selectEvaluationItems,
  selectPendingReviewCount,
} from '../../../store/slices/evaluation';

function useItemMessage(item: EvaluationItemType) {
  const { t } = useTranslation();

  if (item.status === 'correct') return t('evaluationResult.status.correct');

  if (item.status === 'incorrect') {
    if (!item.image) return t('evaluationResult.status.timeout');
    if (item.strokesCount === 0) return t('evaluationResult.status.empty');

    const expectedStrokes = item.kanji.kanji?.strokes;
    return t('evaluationResult.status.wrongStrokes', { expected: expectedStrokes, actual: item.strokesCount });
  }

  // status === 'review'
  if (item.userConfirmation === true) return t('evaluationResult.status.confirmedCorrect');
  if (item.userConfirmation === false) return t('evaluationResult.status.confirmedIncorrect');
  return t('evaluationResult.status.review');
}

function StatusIcon({ item }: { item: EvaluationItemType }) {
  const effectiveStatus = getEffectiveStatus(item);

  if (effectiveStatus === 'correct') {
    return (
      <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundSuccessLight }]}>
        <Icon source={Assets.icons.check} size={16} tintColor={Colors.$iconSuccess} />
      </RNView>
    );
  }

  if (effectiveStatus === 'incorrect') {
    return (
      <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundPrimaryLight }]}>
        <Icon source={Assets.icons.cross} size={16} tintColor={Colors.$iconPrimary} />
      </RNView>
    );
  }

  return (
    <RNView style={[styles.statusIcon, { backgroundColor: Colors.$backgroundWarningLight }]}>
      <Text text80BO $textWarning>
        ?
      </Text>
    </RNView>
  );
}

function ResultItemRow({ item }: { item: EvaluationItemType }) {
  const message = useItemMessage(item);

  return (
    <RNView style={styles.row}>
      {item.image ? (
        <Image source={{ uri: `data:image/png;base64,${item.image}` }} style={styles.thumbnail} />
      ) : (
        <RNView style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}
      <RNView style={styles.rowContent}>
        <RNView style={styles.rowHeader}>
          <Text text40BL>{item.kanji.kanji?.character}</Text>
          <StatusIcon item={item} />
        </RNView>
        <Text text90M $textDefault numberOfLines={2}>
          {message}
        </Text>
      </RNView>
    </RNView>
  );
}

export default function EvaluationResult() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const items = useSelector(selectEvaluationItems);
  const correctCount = useSelector(selectCorrectCount);
  const pendingReviewCount = useSelector(selectPendingReviewCount);

  const buttonLabel = useMemo(
    () =>
      pendingReviewCount > 0
        ? t('evaluationResult.button.review', { count: pendingReviewCount })
        : t('evaluationResult.button.validate'),
    [pendingReviewCount, t],
  );

  return (
    <View style={styles.container}>
      <RNView style={styles.summary}>
        <Text text60BL>{t('evaluationResult.summary.score', { correct: correctCount, total: items.length })}</Text>
        {pendingReviewCount > 0 && (
          <Text text90M $textWarning>
            {t('evaluationResult.summary.pending', { count: pendingReviewCount })}
          </Text>
        )}
      </RNView>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.map((item, index) => (
          // Multiple items can share the same kanji: index is the stable identity here
          <ResultItemRow key={`${item.kanji.kanji_id}-${index}`} item={item} />
        ))}
      </ScrollView>
      <RNView style={[styles.stickyBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Actionable once the review flow (commit 5) and validation (commit 6) are wired */}
        <Button label={buttonLabel} disabled />
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.$backgroundDefault,
  },
  summary: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.$outlineDefault + '22',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.$backgroundGeneralLight,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.$outlineDefault + '22',
  },
});
