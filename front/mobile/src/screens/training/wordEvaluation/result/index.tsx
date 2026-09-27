import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, View } from 'react-native-ui-lib';

import { screenNames } from '../../../../constants/screens';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useStore';
import { useToaster } from '../../../../providers/toaster';
import { core } from '../../../../services/http';
import { completeMissionTask } from '../../../../store/slices/missions';
import { enqueueSessionFinish } from '../../../../store/slices/syncQueue';
import { syncKanjiProgression, user } from '../../../../store/slices/user';
import {
  clearLocalSession,
  computeWordProgressionDeltas,
  confirmItem,
  reset as resetWordEvaluation,
  selectWordCorrectCount,
  selectWordEvaluationItems,
  selectWordEvaluationSessionId,
  selectWordPendingReviewCount,
  toWordQuestion,
} from '../../../../store/slices/wordEvaluation';
import ResultItemRow from './components/resultItemRow';
import WordReviewModal from './components/reviewModal';
import { useResultStyles } from './hooks/useResultStyles';

export default function WordEvaluationResult() {
  const { t } = useTranslation();
  const styles = useResultStyles();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const items = useAppSelector(selectWordEvaluationItems);
  const correctCount = useAppSelector(selectWordCorrectCount);
  const pendingReviewCount = useAppSelector(selectWordPendingReviewCount);
  const sessionId = useAppSelector(selectWordEvaluationSessionId);
  const userId = useAppSelector((state) => state.user.userId);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

      const nextPendingIndex = items.findIndex(
        (item, index) => index !== activeIndex && item.status === 'review' && item.userConfirmation === null,
      );
      setActiveIndex(nextPendingIndex === -1 ? null : nextPendingIndex);
    },
    [activeIndex, dispatch, items],
  );

  const handleValidate = useCallback(async () => {
    // Word evaluation feeds its own word-keyed progression, kept separate from kanji progression
    const deltas = computeWordProgressionDeltas(items);
    deltas.forEach((delta) => dispatch(user.actions.updateWordProgression(delta)));
    if (correctCount > 0) dispatch(user.actions.addScore(correctCount));

    setIsSaving(true);
    const action = await dispatch(syncKanjiProgression());
    setIsSaving(false);

    if (syncKanjiProgression.fulfilled.match(action)) {
      await clearLocalSession();

      // Best-effort: missing a daily mission tick isn't worth blocking or erroring the user over
      if (userId) {
        dispatch(completeMissionTask({ userId, task: 'wordSession' }));
      }

      // Best-effort, same as the per-answer PATCH: a network hiccup here shouldn't block the
      // user from moving on — queued for retry instead of dropped, see syncQueue.ts
      if (sessionId) {
        // A 'review' item's final verdict only lands in Redux when the user picks it in the modal
        // above — resynced here so the stored session reflects it too, not just the idle/initial
        // per-answer PATCH from updateItemSlots
        items.forEach((item) => {
          if (!item.word.word_id) return;
          core.sessionsService!.updateQuestion(sessionId, toWordQuestion(item)).catch(() => undefined);
        });

        core.sessionsService!.finish(sessionId, correctCount).catch(() => {
          dispatch(enqueueSessionFinish({ sessionId, score: correctCount }));
        });
      } else if (userId) {
        // Ran entirely offline: push a finished record now for history, if a connection happens
        // to be back by the time the run is done — word progress itself is already saved either way
        (async () => {
          try {
            const response = await core.sessionsService!.create({ userId, type: 'word', questions: items.map(toWordQuestion) });
            try {
              await core.sessionsService!.finish(response.data.sessionId, correctCount);
            } catch {
              dispatch(enqueueSessionFinish({ sessionId: response.data.sessionId, score: correctCount }));
            }
          } catch {
            dispatch(enqueueSessionFinish({ userId, kind: 'word', questions: items.map(toWordQuestion), score: correctCount }));
          }
        })();
      }

      dispatch(resetWordEvaluation());
      navigation.navigate(screenNames.HOME);
      toast?.show({ message: t('wordEvaluationResult.toast.success'), type: 'success' });
    } else {
      toast?.show({ message: t('wordEvaluationResult.toast.error'), type: 'failure' });
    }
  }, [items, correctCount, dispatch, navigation, toast, t, sessionId, userId]);

  const buttonLabel = useMemo(
    () =>
      pendingReviewCount > 0
        ? t('wordEvaluationResult.button.review', { count: pendingReviewCount })
        : t('wordEvaluationResult.button.validate'),
    [pendingReviewCount, t],
  );

  return (
    <View style={styles.container}>
      <RNView style={styles.summary}>
        <Text text60BL $textDefault>
          {t('wordEvaluationResult.summary.score', { correct: correctCount, total: items.length })}
        </Text>
        {pendingReviewCount > 0 && (
          <Text text90M $textWarning>
            {t('wordEvaluationResult.summary.pending', { count: pendingReviewCount })}
          </Text>
        )}
      </RNView>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.map((item, index) => (
          <ResultItemRow key={`${item.word.word?.[0]}-${index}`} item={item} onPress={() => setActiveIndex(index)} />
        ))}
      </ScrollView>
      <RNView style={[styles.stickyBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button label={buttonLabel} disabled={isSaving} onPress={pendingReviewCount > 0 ? openFirstPending : handleValidate} />
      </RNView>
      <WordReviewModal
        item={activeItem}
        position={activePosition}
        total={reviewItems.length}
        onChoose={handleChoose}
        onClose={closeReview}
      />
    </View>
  );
}
