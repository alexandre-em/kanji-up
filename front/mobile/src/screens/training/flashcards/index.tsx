import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View as RNView } from 'react-native';
import { Button, ProgressBar, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { reviewCard, selectDueFlashcards } from '../../../store/slices/flashcards';
import Flashcard from './card';

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const dueFlashcards = useAppSelector(selectDueFlashcards);
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      progressBar: {
        height: 8,
        borderRadius: 4,
      },
      actions: {
        flexDirection: 'row',
        gap: 12,
      },
      actionButton: {
        flex: 1,
      },
    }),
  );

  // Snapshotted once at mount: grading a card can make it due again immediately (a "didn't know"
  // reset), and re-deriving the queue from the live due-selector would loop that same card back
  // in mid-session instead of moving on to the next one
  const [queue] = useState(() => dueFlashcards);
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentCard = queue[index];
  const isSessionOver = index >= queue.length;

  const handleGrade = useCallback(
    (knew: boolean) => {
      if (!currentCard?.kanji_id) return;

      dispatch(reviewCard({ kanjiId: currentCard.kanji_id, knew }));
      setIsRevealed(false);
      setIndex((prev) => prev + 1);
    },
    [currentCard, dispatch],
  );

  if (queue.length === 0 || isSessionOver) {
    return (
      <Layout screen="flashcards">
        <View center flex>
          <Text text70BO $textDefault center>
            {t(queue.length === 0 ? 'flashcards.empty.title' : 'flashcards.sessionOver.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t(queue.length === 0 ? 'flashcards.empty.message' : 'flashcards.sessionOver.message')}
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout screen="flashcards">
      <RNView style={styles.progressHeader}>
        <Text text80M $textNeutral>
          {t('flashcards.progress')}
        </Text>
        <Text text90BO $textPrimary>
          {index + 1} / {queue.length}
        </Text>
      </RNView>
      <ProgressBar progress={((index + 1) / queue.length) * 100} fullWidth style={styles.progressBar} />
      <Spacing y={24} />
      <Flashcard
        kanji={currentCard}
        isRevealed={isRevealed}
        onReveal={() => setIsRevealed(true)}
        revealHint={t('flashcards.reveal')}
      />
      <Spacing y={24} />
      {isRevealed && (
        <RNView style={styles.actions}>
          <Button label={t('flashcards.grade.no')} outline onPress={() => handleGrade(false)} style={styles.actionButton} />
          <Button label={t('flashcards.grade.yes')} onPress={() => handleGrade(true)} style={styles.actionButton} />
        </RNView>
      )}
    </Layout>
  );
}
