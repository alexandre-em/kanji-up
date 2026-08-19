import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Button, ProgressBar, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { reviewCard, selectDueFlashcards } from '../../../store/slices/flashcards';
import { getOne, selectEntities } from '../../../store/slices/kanji';
import { selectActiveList } from '../../../store/slices/lists';
import Flashcard from './components/card';
import { useFlashcardsScreenStyles } from './hooks/useFlashcardsScreenStyles';

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeList = useAppSelector(selectActiveList);
  const kanjiEntities = useAppSelector(selectEntities);
  const dueFlashcards = useAppSelector(selectDueFlashcards);
  const styles = useFlashcardsScreenStyles();

  // The active list only stores kanji_ids — fetch whichever ones aren't already cached before a
  // due-card queue can be built from them
  useEffect(() => {
    activeList?.kanjiIds.forEach((id) => {
      if (!kanjiEntities[id]) dispatch(getOne(id));
    });
  }, [activeList, kanjiEntities, dispatch]);

  const isKanjiPoolReady = !!activeList && activeList.kanjiIds.every((id) => !!kanjiEntities[id]);

  // Snapshotted (not read live): grading a card can make it due again immediately (a "didn't
  // know" reset), and re-deriving the queue from the live due-selector would loop that same card
  // back in mid-session instead of moving on to the next one
  const [queue, setQueue] = useState<Partial<KanjiType>[]>([]);
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasSnapshotted, setHasSnapshotted] = useState(false);

  // react-navigation doesn't always fully unmount a screen it navigates back to, so resetting
  // only in useState's initializer isn't reliable — this re-arms the snapshot every time the
  // screen actually regains focus, whether or not it was torn down in between
  useFocusEffect(
    useCallback(() => {
      setHasSnapshotted(false);
      setIndex(0);
      setIsRevealed(false);
    }, []),
  );

  useEffect(() => {
    if (!isKanjiPoolReady || hasSnapshotted) return;
    setQueue(dueFlashcards);
    setHasSnapshotted(true);
  }, [isKanjiPoolReady, hasSnapshotted, dueFlashcards]);

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

  if (!hasSnapshotted) {
    return <Layout screen="flashcards" loadingMessage={t('loading.title')} />;
  }

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
