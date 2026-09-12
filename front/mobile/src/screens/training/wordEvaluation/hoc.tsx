import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TouchableOpacity, View as RNView } from 'react-native';
import { Button, Colors, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { MIN_LIST_SIZE_FOR_GAME } from '../../../constants/lists';
import { screenNames } from '../../../constants/screens';
import { useRecognitionModel } from '../../../hooks/useRecognitionModel';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useIsOffline } from '../../../providers/network';
import { useToaster } from '../../../providers/toaster';
import { fileNames, fileServiceInstance } from '../../../services/file';
import { core } from '../../../services/http';
import { getOne, search as searchKanji, selectEntities, selectSearchResult } from '../../../store/slices/kanji';
import { lists, selectActiveList, selectLists } from '../../../store/slices/lists';
import { enqueueSessionFinish } from '../../../store/slices/syncQueue';
import { syncKanjiProgression, user } from '../../../store/slices/user';
import { getOne as getOneWord, selectGetOne as selectWordEntities } from '../../../store/slices/word';
import {
  checkActiveSession,
  clearLocalSession,
  computeWordProgressionDeltas,
  filterWordsWithKanji,
  getKanjiCharacters,
  hydrateItems,
  init,
  PendingLocalWordSession,
  selectWordEvaluationItems,
  WordEvaluationItemType,
  WordEvaluationKind,
} from '../../../store/slices/wordEvaluation';
import { selectActiveWordList, selectWordLists, wordLists } from '../../../store/slices/wordLists';
import ActiveListSelector from '../../kanji/difficulty/kanjiList/components/activeListSelector';
import ActiveWordListSelector from '../../wordLists/components/activeWordListSelector';
import WordEvaluationScreen from '.';
import { useWordEvaluationPickerStyles } from './hooks/useWordEvaluationPickerStyles';

const NUMBER_OF_WORDS = 20;
const KANJI_KIND: WordEvaluationKind = 'kanji';
const WORD_KIND: WordEvaluationKind = 'word';

type PendingResume = { source: 'local'; session: PendingLocalWordSession } | { source: 'server'; session: SessionType };

export default function WordEvaluationHoc() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoaded: isModelLoaded, hasError: modelLoadError } = useRecognitionModel();
  const toast = useToaster();
  const { t } = useTranslation();
  const styles = useWordEvaluationPickerStyles();
  const isOffline = useIsOffline();
  const isPremium = useAppSelector((state) => state.user.subscriptionPlan === 'premium');
  const userId = useAppSelector((state) => state.user.userId);

  const [kind, setKind] = useState<WordEvaluationKind>(KANJI_KIND);
  const isKanji = kind === KANJI_KIND;
  const [isChecking, setIsChecking] = useState(true);
  const [pendingResume, setPendingResume] = useState<PendingResume | null>(null);

  const activeKanjiList = useAppSelector(selectActiveList);
  const allKanjiLists = useAppSelector(selectLists);
  const kanjiEntities = useAppSelector(selectEntities);

  const activeWordList = useAppSelector(selectActiveWordList);
  const allWordLists = useAppSelector(selectWordLists);
  const wordEntities = useAppSelector(selectWordEntities);

  const activeList = isKanji ? activeKanjiList : activeWordList;

  useEffect(() => {
    if (modelLoadError) toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
  }, [modelLoadError, toast]);

  // Kanji mode needs the list's kanji entities to build the character seed for the practice-word
  // API call; word mode needs the word entities themselves, since those ARE the practice set
  useEffect(() => {
    if (isKanji) {
      activeKanjiList?.kanjiIds.forEach((id) => {
        if (!kanjiEntities[id]) dispatch(getOne(id));
      });
    } else {
      activeWordList?.wordIds.forEach((id) => {
        if (!wordEntities[id]) dispatch(getOneWord(id));
      });
    }
  }, [isKanji, activeKanjiList, activeWordList, kanjiEntities, wordEntities, dispatch]);

  const isPoolReady = isKanji
    ? !!activeKanjiList && activeKanjiList.kanjiIds.every((id) => !!kanjiEntities[id])
    : !!activeWordList && activeWordList.wordIds.every((id) => !!wordEntities[id]);

  // Resolves a pending session (either source) into the shape hydrateItems expects — the server
  // one only stored wordId per question, so the full word data has to be re-fetched
  const resolvePendingItems = useCallback(async (pending: PendingResume) => {
    if (pending.source === 'local') {
      return { items: pending.session.items, sessionId: pending.session.sessionId };
    }

    const session = pending.session;
    const wordResults = await Promise.all(
      session.questions.map((question) => core.wordService!.getOne({ id: (question as WordSessionQuestion).wordId })),
    );
    const items: WordEvaluationItemType[] = wordResults.map((result, index) => {
      const question = session.questions[index] as WordSessionQuestion;

      return {
        word: result.data,
        slots: question.slots,
        status: question.status,
        userConfirmation: question.userConfirmation,
      };
    });

    return { items, sessionId: session.sessionId };
  }, []);

  // Free plan: no continuation across interruptions. Whatever was already answered still counts
  // (word progress + a closed-out session for history), the rest is simply dropped.
  const finalizeAsIncomplete = useCallback(
    async (pending: PendingResume) => {
      try {
        const { items, sessionId } = await resolvePendingItems(pending);
        const answered = items.filter((item) => item.status !== 'idle');

        if (answered.length > 0) {
          const deltas = computeWordProgressionDeltas(answered);
          deltas.forEach((delta) => dispatch(user.actions.updateWordProgression(delta)));
          const points = deltas.filter((delta) => delta.correct).length;
          if (points > 0) dispatch(user.actions.addScore(points));
          await dispatch(syncKanjiProgression());

          const correctCount = deltas.filter((delta) => delta.correct).length;

          if (sessionId) {
            core.sessionsService!.finish(sessionId, correctCount).catch(() => {
              dispatch(enqueueSessionFinish({ sessionId, score: correctCount }));
            });
          } else if (userId) {
            (async () => {
              try {
                const response = await core.sessionsService!.create({
                  userId,
                  type: 'word',
                  questions: items.map((item) => ({
                    wordId: item.word.word_id ?? '',
                    slots: item.slots,
                    status: item.status,
                    userConfirmation: item.userConfirmation,
                  })),
                });
                try {
                  await core.sessionsService!.finish(response.data.sessionId, correctCount);
                } catch {
                  dispatch(enqueueSessionFinish({ sessionId: response.data.sessionId, score: correctCount }));
                }
              } catch {
                dispatch(
                  enqueueSessionFinish({
                    userId,
                    kind: 'word',
                    questions: items.map((item) => ({
                      wordId: item.word.word_id ?? '',
                      slots: item.slots,
                      status: item.status,
                      userConfirmation: item.userConfirmation,
                    })),
                    score: correctCount,
                  }),
                );
              }
            })();
          }
        }
      } catch {
        // Best-effort: even if the partial save fails, the pending run is still discarded below
      } finally {
        await clearLocalSession();
      }
    },
    [dispatch, resolvePendingItems, userId],
  );

  const startSession = useCallback(async () => {
    setIsChecking(true);

    // A locally suspended run always wins: it survives regardless of connectivity, and starting
    // another one on top of it would abandon progress the server may not even know about yet
    const localPending: PendingLocalWordSession | null = await fileServiceInstance.read(fileNames.PENDING_WORD_SESSION);
    let pending: PendingResume | null =
      localPending && localPending.items.length > 0 ? { source: 'local', session: localPending } : null;

    if (!pending) {
      const action = await dispatch(checkActiveSession(isOffline));
      const session = checkActiveSession.fulfilled.match(action) ? action.payload : null;
      if (session) pending = { source: 'server', session };
    }

    if (pending) {
      if (isPremium) {
        setPendingResume(pending);
        setIsChecking(false);
        return;
      }

      await finalizeAsIncomplete(pending);
    }

    void dispatch(init({ kind, number: NUMBER_OF_WORDS, isOffline }));
    setIsChecking(false);
  }, [dispatch, kind, isPremium, isOffline, finalizeAsIncomplete]);

  useEffect(() => {
    if (!isPoolReady) return;
    void startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPoolReady, kind, activeList?.id]);

  const handleResume = useCallback(async () => {
    if (!pendingResume) return;

    const { items, sessionId } = await resolvePendingItems(pendingResume);
    dispatch(hydrateItems({ items, currentIndex: pendingResume.session.currentIndex, sessionId }));
    setPendingResume(null);
  }, [pendingResume, dispatch, resolvePendingItems]);

  const handleStartOver = useCallback(() => {
    const abandonSessionId = pendingResume?.session.sessionId ?? undefined;
    void dispatch(init({ kind, number: NUMBER_OF_WORDS, abandonSessionId, isOffline }));
    setPendingResume(null);
  }, [dispatch, kind, pendingResume, isOffline]);

  // Whichever mode built the practice set, the kanji actually drawn during the run can include
  // characters outside any list (see wordEvaluation.ts's updateItemSlots) — resolved here so
  // their stroke counts are ready before the user reaches them
  const items = useAppSelector(selectWordEvaluationItems);
  const searchResults = useAppSelector(selectSearchResult);

  const eligibleWordCount = useMemo(() => {
    if (isKanji || !activeWordList) return null;
    return filterWordsWithKanji(activeWordList.wordIds.map((id) => wordEntities[id]).filter((word): word is WordType => !!word))
      .length;
  }, [isKanji, activeWordList, wordEntities]);

  const practiceCharacters = useMemo(
    () => Array.from(new Set(items.flatMap((item) => getKanjiCharacters(item.word.word?.[0] ?? '')))),
    [items],
  );

  useEffect(() => {
    practiceCharacters.forEach((character) => {
      if (!searchResults[character]) dispatch(searchKanji({ query: character, limit: 5 }));
    });
  }, [practiceCharacters, searchResults, dispatch]);

  const isCharacterPoolReady = practiceCharacters.every((character) => !!searchResults[character]);

  const segments: { key: WordEvaluationKind; label: string }[] = [
    { key: KANJI_KIND, label: t('history.segment.kanji') },
    { key: WORD_KIND, label: t('history.segment.word') },
  ];

  const picker = (
    <>
      <Button
        label={t('training.viewStats')}
        outline
        size={Button.sizes.small}
        onPress={() => navigation.navigate(screenNames.PROFILE as never)}
      />
      <Spacing y={16} />
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
    </>
  );

  if (!activeList) {
    return (
      <Layout screen="wordEvaluation">
        {picker}
        <Spacing y={16} />
        <View center flex>
          <Text text70BO $textDefault center>
            {t('wordEvaluation.noList.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('wordEvaluation.noList.message')}
          </Text>
        </View>
      </Layout>
    );
  }

  const activeListSize = isKanji ? (activeKanjiList?.kanjiIds.length ?? 0) : (activeWordList?.wordIds.length ?? 0);

  if (activeListSize < MIN_LIST_SIZE_FOR_GAME) {
    return (
      <Layout screen="wordEvaluation">
        {picker}
        <Spacing y={16} />
        <View center flex>
          <Text text70BO $textDefault center>
            {t('wordEvaluation.tooFewItems.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('wordEvaluation.tooFewItems.message', { min: MIN_LIST_SIZE_FOR_GAME })}
          </Text>
        </View>
      </Layout>
    );
  }

  if (!isModelLoaded || !isPoolReady || !isCharacterPoolReady || isChecking) {
    return (
      <Layout screen="wordEvaluation">
        {picker}
        <Spacing y={16} />
        <View center flex>
          <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="large" />
          <Spacing y={12} />
          <Text $textDefault>{t('evaluation.loadingModel')}</Text>
        </View>
      </Layout>
    );
  }

  if (pendingResume) {
    return (
      <Layout screen="wordEvaluation">
        {picker}
        <Spacing y={16} />
        <View center flex>
          <Text text70BO $textDefault center>
            {t('evaluation.resume.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('evaluation.resume.message')}
          </Text>
          <Spacing y={20} />
          <Button label={t('evaluation.resume.resume')} onPress={handleResume} />
          <Spacing y={10} />
          <Button label={t('evaluation.resume.startOver')} outline onPress={handleStartOver} />
        </View>
      </Layout>
    );
  }

  if (!isKanji && eligibleWordCount !== null && eligibleWordCount < MIN_LIST_SIZE_FOR_GAME) {
    return (
      <Layout screen="wordEvaluation">
        {picker}
        <Spacing y={16} />
        <View center flex>
          <Text text70BO $textDefault center>
            {t('wordEvaluation.tooFewKanjiWords.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('wordEvaluation.tooFewKanjiWords.message', { min: MIN_LIST_SIZE_FOR_GAME })}
          </Text>
        </View>
      </Layout>
    );
  }

  return <WordEvaluationScreen />;
}
