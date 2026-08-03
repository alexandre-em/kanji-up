import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Assets, Button, Colors, Icon, Text, View } from 'react-native-ui-lib';

import { screenNames } from '../../../constants/screens';
import { useEvaluationInterstitialAd } from '../../../hooks/useEvaluationInterstitialAd';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { core } from '../../../services/http';
import {
  confirmItem,
  EvaluationItemType,
  getEffectiveStatus,
  reset as resetEvaluation,
  selectCorrectCount,
  selectEvaluationItems,
  selectEvaluationSessionId,
  selectPendingReviewCount,
} from '../../../store/slices/evaluation';
import { recordResults } from '../../../store/slices/progression';
import ReviewModal from './reviewModal';

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

type ResultItemRowProps = {
  item: EvaluationItemType;
  /** Only 'review' answers are interactive: tapping one opens the review modal on it */
  onPress?: () => void;
};

function ResultItemRow({ item, onPress }: ResultItemRowProps) {
  const message = useItemMessage(item);

  const content = (
    <>
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
    </>
  );

  if (!onPress) return <RNView style={styles.row}>{content}</RNView>;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={message}>
      {content}
    </TouchableOpacity>
  );
}

export default function EvaluationResult() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const items = useAppSelector(selectEvaluationItems);
  const correctCount = useAppSelector(selectCorrectCount);
  const pendingReviewCount = useAppSelector(selectPendingReviewCount);
  const sessionId = useAppSelector(selectEvaluationSessionId);
  const showInterstitialAd = useEvaluationInterstitialAd();

  // Index into `items` of the answer currently shown in the review modal, null when closed
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Guards against a double tap firing two saves while the AsyncStorage write is in flight
  const [isSaving, setIsSaving] = useState(false);

  // All 'review' answers, resolved or not: gives the modal's "2 / 6" position, stable across choices
  const reviewItems = useMemo(() => items.filter((item) => item.status === 'review'), [items]);
  const activeItem = activeIndex !== null ? items[activeIndex] : undefined;
  const activePosition = activeItem ? reviewItems.indexOf(activeItem) + 1 : 0;

  const openFirstPending = useCallback(() => {
    const firstPendingIndex = items.findIndex((item) => item.status === 'review' && item.userConfirmation === null);
    if (firstPendingIndex !== -1) setActiveIndex(firstPendingIndex);
  }, [items]);

  const closeReview = useCallback(() => setActiveIndex(null), []);

  const handleChoose = useCallback(
    (isCorrect: boolean) => {
      if (activeIndex === null) return;

      dispatch(confirmItem({ index: activeIndex, isCorrect }));

      // Chain to the next still-undecided review answer, excluding the one just resolved
      // (its userConfirmation in this pre-dispatch snapshot is still null)
      const nextPendingIndex = items.findIndex(
        (item, index) => index !== activeIndex && item.status === 'review' && item.userConfirmation === null,
      );
      setActiveIndex(nextPendingIndex === -1 ? null : nextPendingIndex);
    },
    [activeIndex, dispatch, items],
  );

  const handleValidate = useCallback(async () => {
    // One entry per tested kanji: a kanji drawn twice in the session counts as two attempts
    const results = items
      .filter((item): item is typeof item & { kanji: { kanji_id: string } } => !!item.kanji.kanji_id)
      .map((item) => ({ kanjiId: item.kanji.kanji_id, isCorrect: getEffectiveStatus(item) === 'correct' }));

    setIsSaving(true);
    const action = await dispatch(recordResults(results));
    setIsSaving(false);

    if (recordResults.fulfilled.match(action)) {
      // Best-effort, same as the per-answer PATCH: a network hiccup here shouldn't block the
      // user from moving on, the session just stays resumable server-side a bit longer
      if (sessionId) core.sessionsService!.finish(sessionId, correctCount).catch(() => undefined);

      dispatch(resetEvaluation());
      navigation.navigate(screenNames.HOME);
      toast?.show({ message: t('evaluationResult.toast.success'), type: 'success' });
      // Natural break point: the session is over and results are saved, so an interstitial here
      // (a no-op for premium/adsDeactivated users) doesn't interrupt anything mid-task
      showInterstitialAd();
    } else {
      // Left on this screen with the button re-enabled: nothing is lost, they can just retry
      toast?.show({ message: t('evaluationResult.toast.error'), type: 'failure' });
    }
  }, [items, dispatch, navigation, toast, t, showInterstitialAd, sessionId, correctCount]);

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
          <ResultItemRow
            key={`${item.kanji.kanji_id}-${index}`}
            item={item}
            onPress={item.status === 'review' ? () => setActiveIndex(index) : undefined}
          />
        ))}
      </ScrollView>
      <RNView style={[styles.stickyBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button label={buttonLabel} disabled={isSaving} onPress={pendingReviewCount > 0 ? openFirstPending : handleValidate} />
      </RNView>
      <ReviewModal
        item={activeItem}
        position={activePosition}
        total={reviewItems.length}
        onChoose={handleChoose}
        onClose={closeReview}
      />
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
    borderBottomColor: Colors.$outlineNeutral,
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
    borderTopColor: Colors.$outlineNeutral,
  },
});
