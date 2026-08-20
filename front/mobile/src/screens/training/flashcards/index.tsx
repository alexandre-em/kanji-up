import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View as RNView } from 'react-native';
import { Button, Colors, ProgressBar, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { reviewCard, reviewWordCard, selectDueFlashcards, selectDueWordFlashcards } from '../../../store/slices/flashcards';
import { getOne, selectEntities } from '../../../store/slices/kanji';
import { lists, selectActiveList, selectLists } from '../../../store/slices/lists';
import { getOne as getOneWord, selectGetOne as selectWordEntities } from '../../../store/slices/word';
import { selectActiveWordList, selectWordLists, wordLists } from '../../../store/slices/wordLists';
import ActiveListSelector from '../../kanji/difficulty/kanjiList/components/activeListSelector';
import ActiveWordListSelector from '../../wordLists/components/activeWordListSelector';
import Flashcard, { FlashcardKind } from './components/card';
import { useFlashcardsScreenStyles } from './hooks/useFlashcardsScreenStyles';

const KANJI_SEGMENT: FlashcardKind = 'kanji';
const WORD_SEGMENT: FlashcardKind = 'word';

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const styles = useFlashcardsScreenStyles();
  const [kind, setKind] = useState<FlashcardKind>(KANJI_SEGMENT);

  const activeKanjiList = useAppSelector(selectActiveList);
  const allKanjiLists = useAppSelector(selectLists);
  const kanjiEntities = useAppSelector(selectEntities);
  const dueKanjiFlashcards = useAppSelector(selectDueFlashcards);

  const activeWordList = useAppSelector(selectActiveWordList);
  const allWordLists = useAppSelector(selectWordLists);
  const wordEntities = useAppSelector(selectWordEntities);
  const dueWordFlashcards = useAppSelector(selectDueWordFlashcards);

  const isKanji = kind === KANJI_SEGMENT;
  const activeList = isKanji ? activeKanjiList : activeWordList;
  const activeListIds = useMemo(
    () => (isKanji ? (activeKanjiList?.kanjiIds ?? []) : (activeWordList?.wordIds ?? [])),
    [isKanji, activeKanjiList, activeWordList],
  );
  const dueFlashcards = isKanji ? dueKanjiFlashcards : dueWordFlashcards;

  // The active list only stores ids — fetch whichever ones aren't already cached before a
  // due-card queue can be built from them
  useEffect(() => {
    activeListIds.forEach((id) => {
      if (isKanji && !kanjiEntities[id]) dispatch(getOne(id));
      if (!isKanji && !wordEntities[id]) dispatch(getOneWord(id));
    });
  }, [activeListIds, isKanji, kanjiEntities, wordEntities, dispatch]);

  const isPoolReady = isKanji
    ? !!activeKanjiList && activeListIds.every((id) => !!kanjiEntities[id])
    : !!activeWordList && activeListIds.every((id) => !!wordEntities[id]);

  // Snapshotted (not read live): grading a card can make it due again immediately (a "didn't
  // know" reset), and re-deriving the queue from the live due-selector would loop that same card
  // back in mid-session instead of moving on to the next one
  const [queue, setQueue] = useState<(Partial<KanjiType> | Partial<WordType>)[]>([]);
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

  // Switching Kanji/Mots — or picking a different list within the current kind — is the same as
  // a fresh visit: re-snapshot the queue
  useEffect(() => {
    setHasSnapshotted(false);
    setIndex(0);
    setIsRevealed(false);
  }, [kind, activeKanjiList?.id, activeWordList?.id]);

  useEffect(() => {
    if (!isPoolReady || hasSnapshotted) return;
    setQueue(dueFlashcards);
    setHasSnapshotted(true);
  }, [isPoolReady, hasSnapshotted, dueFlashcards]);

  const currentCard = queue[index];
  const isSessionOver = index >= queue.length;

  const handleGrade = useCallback(
    (knew: boolean) => {
      if (isKanji) {
        const kanjiId = (currentCard as Partial<KanjiType> | undefined)?.kanji_id;
        if (!kanjiId) return;
        dispatch(reviewCard({ kanjiId, knew }));
      } else {
        const wordId = (currentCard as Partial<WordType> | undefined)?.word_id;
        if (!wordId) return;
        dispatch(reviewWordCard({ wordId, knew }));
      }
      setIsRevealed(false);
      setIndex((prev) => prev + 1);
    },
    [currentCard, isKanji, dispatch],
  );

  const segments: { key: FlashcardKind; label: string }[] = [
    { key: KANJI_SEGMENT, label: t('history.segment.kanji') },
    { key: WORD_SEGMENT, label: t('history.segment.word') },
  ];

  return (
    <Layout screen="flashcards">
      <RNView style={styles.segmentedControl}>
        {segments.map((segment) => {
          const isActive = segment.key === kind;

          return (
            <TouchableOpacity
              key={segment.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => setKind(segment.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}>
              <Text style={{ color: isActive ? '#fff' : Colors.$textNeutral }}>{segment.label}</Text>
            </TouchableOpacity>
          );
        })}
      </RNView>
      <Spacing y={16} />
      {isKanji ? (
        <ActiveListSelector
          lists={Object.values(allKanjiLists)}
          activeList={activeKanjiList}
          onSelect={(id) => dispatch(lists.actions.setActiveList(id))}
        />
      ) : (
        <ActiveWordListSelector
          lists={Object.values(allWordLists)}
          activeList={activeWordList}
          onSelect={(id) => dispatch(wordLists.actions.setActiveList(id))}
        />
      )}
      <Spacing y={16} />

      {!activeList ? (
        <View center flex>
          <Text text70BO $textDefault center>
            {t('flashcards.noList.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('flashcards.noList.message')}
          </Text>
        </View>
      ) : !hasSnapshotted ? (
        <Text text80M $textGeneral center>
          {t('loading.title')}
        </Text>
      ) : queue.length === 0 || isSessionOver ? (
        <View center flex>
          <Text text70BO $textDefault center>
            {t(queue.length === 0 ? 'flashcards.empty.title' : 'flashcards.sessionOver.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t(queue.length === 0 ? 'flashcards.empty.message' : 'flashcards.sessionOver.message')}
          </Text>
        </View>
      ) : (
        <>
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
            kind={kind}
            item={currentCard!}
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
        </>
      )}
    </Layout>
  );
}
