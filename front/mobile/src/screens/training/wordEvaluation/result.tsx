import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Assets, Button, Colors, Icon, Text, View } from 'react-native-ui-lib';

import { screenNames } from '../../../constants/screens';
import { useEvaluationInterstitialAd } from '../../../hooks/useEvaluationInterstitialAd';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { completeMissionTask } from '../../../store/slices/missions';
import { syncKanjiProgression, user } from '../../../store/slices/user';
import {
  computeWordProgressionDeltas,
  confirmItem,
  getEffectiveStatus,
  getKanjiCharacters,
  reset as resetWordEvaluation,
  selectWordCorrectCount,
  selectWordEvaluationItems,
  selectWordPendingReviewCount,
  WordEvaluationItemType,
} from '../../../store/slices/wordEvaluation';
import WordReviewModal from './reviewModal';
import { useResultStyles } from './useResultStyles';

function useItemMessage(item: WordEvaluationItemType) {
  const { t } = useTranslation();
  const expectedLength = getKanjiCharacters(item.word.word?.[0] ?? '').length;

  if (item.status === 'correct') return t('wordEvaluationResult.status.correct');

  if (item.status === 'incorrect') {
    if (item.slots.length !== expectedLength) {
      return t('wordEvaluationResult.status.wrongLength', { expected: expectedLength, actual: item.slots.length });
    }
    return t('wordEvaluationResult.status.empty');
  }

  if (item.userConfirmation === true) return t('wordEvaluationResult.status.confirmedCorrect');
  if (item.userConfirmation === false) return t('wordEvaluationResult.status.confirmedIncorrect');
  return t('wordEvaluationResult.status.review');
}

function StatusIcon({ item }: { item: WordEvaluationItemType }) {
  const styles = useResultStyles();
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
  item: WordEvaluationItemType;
  onPress: () => void;
};

function ResultItemRow({ item, onPress }: ResultItemRowProps) {
  const styles = useResultStyles();
  const message = useItemMessage(item);
  const wordText = item.word.word?.[0] ?? '';
  const meaning = item.word.definition?.[0]?.meaning?.join(', ');

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={message}>
      <RNView style={styles.wordBox}>
        <Text text40BL $textDefault>
          {wordText}
        </Text>
      </RNView>
      <RNView style={styles.rowContent}>
        <RNView style={styles.rowHeader}>
          <Text text80M $textDefault numberOfLines={1} style={styles.meaning}>
            {meaning}
          </Text>
          <StatusIcon item={item} />
        </RNView>
        <Text text90M $textDefault numberOfLines={2}>
          {message}
        </Text>
      </RNView>
    </TouchableOpacity>
  );
}

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
