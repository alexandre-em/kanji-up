import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, View } from 'react-native-ui-lib';

import { hasNewlyMasteredKanji } from '../../../constants/progression';
import { screenNames } from '../../../constants/screens';
import { useEvaluationInterstitialAd } from '../../../hooks/useEvaluationInterstitialAd';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { core } from '../../../services/http';
import {
  clearLocalSession,
  computeProgressionDeltas,
  confirmItem,
  reset as resetEvaluation,
  selectCorrectCount,
  selectEvaluationItems,
  selectEvaluationSessionId,
  selectPendingReviewCount,
  toKanjiQuestion,
} from '../../../store/slices/evaluation';
import { completeMissionTask } from '../../../store/slices/missions';
import { syncKanjiProgression, user } from '../../../store/slices/user';
import ResultItemRow from './resultItemRow';
import ReviewModal from './reviewModal';
import { useResultStyles } from './useResultStyles';

export default function EvaluationResult() {
  const { t } = useTranslation();
  const styles = useResultStyles();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const items = useAppSelector(selectEvaluationItems);
  const correctCount = useAppSelector(selectCorrectCount);
  const pendingReviewCount = useAppSelector(selectPendingReviewCount);
  const sessionId = useAppSelector(selectEvaluationSessionId);
  const userId = useAppSelector((state) => state.user.userId);
  const progressionState = useAppSelector((state) => state.user.progression);
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
    const deltas = computeProgressionDeltas(items);
    const justMasteredAKanji = hasNewlyMasteredKanji(deltas, progressionState);
    deltas.forEach((delta) => dispatch(user.actions.updateProgression(delta)));
    const points = deltas.filter((delta) => delta.correct).length;
    if (points > 0) dispatch(user.actions.addScore(points));

    setIsSaving(true);
    const action = await dispatch(syncKanjiProgression());
    setIsSaving(false);

    if (syncKanjiProgression.fulfilled.match(action)) {
      await clearLocalSession();

      // Best-effort: missing a daily mission tick isn't worth blocking or erroring the user over
      if (userId) {
        dispatch(completeMissionTask({ userId, task: 'kanjiSession' }));
        if (justMasteredAKanji) dispatch(completeMissionTask({ userId, task: 'kanjiMastery' }));
      }

      // Best-effort, same as the per-answer PATCH: a network hiccup here shouldn't block the
      // user from moving on
      if (sessionId) {
        core.sessionsService!.finish(sessionId, correctCount).catch(() => undefined);
      } else if (userId) {
        // Ran entirely offline: push a finished record now for history, if a connection happens
        // to be back by the time the run is done — kanji progress itself is already saved either way
        core
          .sessionsService!.create({ userId, type: 'kanji', questions: items.map(toKanjiQuestion) })
          .then((response) => core.sessionsService!.finish(response.data.sessionId, correctCount))
          .catch(() => undefined);
      }

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
  }, [items, dispatch, navigation, toast, t, showInterstitialAd, sessionId, correctCount, userId, progressionState]);

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
        <Text text60BL $textDefault>
          {t('evaluationResult.summary.score', { correct: correctCount, total: items.length })}
        </Text>
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
