import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, View } from 'react-native-ui-lib';

import { screenNames } from '../../../constants/screens';
import { useEvaluationInterstitialAd } from '../../../hooks/useEvaluationInterstitialAd';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { completeMissionTask } from '../../../store/slices/missions';
import { syncKanjiProgression, user } from '../../../store/slices/user';
import {
  computeWordProgressionDeltas,
  confirmItem,
  reset as resetWordEvaluation,
  selectWordCorrectCount,
  selectWordEvaluationItems,
  selectWordPendingReviewCount,
} from '../../../store/slices/wordEvaluation';
import ResultItemRow from './resultItemRow';
import WordReviewModal from './reviewModal';
import { useResultStyles } from './useResultStyles';

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
  const userId = useAppSelector((state) => state.user.userId);
  const showInterstitialAd = useEvaluationInterstitialAd();

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
      // Best-effort: missing a daily mission tick isn't worth blocking or erroring the user over
      if (userId) {
        dispatch(completeMissionTask({ userId, task: 'wordSession' }));
      }

      dispatch(resetWordEvaluation());
      navigation.navigate(screenNames.HOME);
      toast?.show({ message: t('wordEvaluationResult.toast.success'), type: 'success' });
      showInterstitialAd();
    } else {
      toast?.show({ message: t('wordEvaluationResult.toast.error'), type: 'failure' });
    }
  }, [items, correctCount, dispatch, navigation, toast, t, showInterstitialAd, userId]);

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
