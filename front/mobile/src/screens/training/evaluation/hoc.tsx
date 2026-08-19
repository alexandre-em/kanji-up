import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { hasNewlyMasteredKanji } from '../../../constants/progression';
import { useRecognitionModel } from '../../../hooks/useRecognitionModel';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { fileNames, fileServiceInstance } from '../../../services/file';
import { core } from '../../../services/http';
import {
  checkActiveSession,
  clearLocalSession,
  computeProgressionDeltas,
  EvaluationItemType,
  getEffectiveStatus,
  hydrateItems,
  PendingLocalSession,
  selectEvaluationItems,
  selectEvaluationStatus,
  startFreshSession,
} from '../../../store/slices/evaluation';
import { getOne, selectEntities } from '../../../store/slices/kanji';
import { selectActiveList } from '../../../store/slices/lists';
import { completeMissionTask } from '../../../store/slices/missions';
import { syncKanjiProgression, user } from '../../../store/slices/user';
import EvaluationScreen from '.';

const numberKanji = 20;

type PendingResume = { source: 'local'; session: PendingLocalSession } | { source: 'server'; session: SessionType };

export default function EvaluationHoc() {
  const activeList = useAppSelector(selectActiveList);
  const kanjiEntities = useAppSelector(selectEntities);
  const evaluationItems = useAppSelector(selectEvaluationItems);
  const evaluationStatus = useAppSelector(selectEvaluationStatus);
  const isPremium = useAppSelector((state) => state.user.subscriptionPlan === 'premium');
  const userId = useAppSelector((state) => state.user.userId);
  const progressionState = useAppSelector((state) => state.user.progression);
  const dispatch = useAppDispatch();
  const { isLoaded: isModelLoaded, hasError: modelLoadError } = useRecognitionModel();
  const [isChecking, setIsChecking] = useState(true);
  const [pendingResume, setPendingResume] = useState<PendingResume | null>(null);
  const toast = useToaster();
  const { t } = useTranslation();

  // The active list only stores kanji_ids — fetch whichever ones aren't already cached before a
  // session can be built from them
  useEffect(() => {
    activeList?.kanjiIds.forEach((id) => {
      if (!kanjiEntities[id]) dispatch(getOne(id));
    });
  }, [activeList, kanjiEntities, dispatch]);

  const isKanjiPoolReady = !!activeList && activeList.kanjiIds.every((id) => !!kanjiEntities[id]);

  const kanjiQueue = useCallback(() => {
    const kanjiValues =
      activeList?.kanjiIds.map((id) => kanjiEntities[id]).filter((entity): entity is KanjiType => !!entity) ?? [];

    if (kanjiValues.length > 0) {
      return Array.from(Array(numberKanji).keys()).map(() => kanjiValues[Math.floor(Math.random() * kanjiValues.length)]);
    }
    return [];
  }, [activeList, kanjiEntities]);

  useEffect(() => {
    if (modelLoadError) toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
  }, [modelLoadError, toast]);

  // Resolves a pending session (either source) into the same shape hydrateItems expects — the
  // server one needs a kanji re-fetch by id since the session only stored kanjiId
  const resolvePendingItems = useCallback(async (pending: PendingResume) => {
    if (pending.source === 'local') {
      return { items: pending.session.items, sessionId: pending.session.sessionId };
    }

    const session = pending.session;
    const kanjiResults = await Promise.all(
      session.questions.map((question) => core.kanjiService!.getOne({ id: (question as KanjiSessionQuestion).kanjiId })),
    );
    const items: EvaluationItemType[] = kanjiResults.map((result, index) => {
      const question = session.questions[index] as KanjiSessionQuestion;

      return {
        kanji: result.data,
        score: null,
        status: question.status,
        image: question.image,
        strokesCount: question.strokesCount,
        userConfirmation: question.userConfirmation,
      };
    });

    return { items, sessionId: session.sessionId };
  }, []);

  // Free plan: no continuation across interruptions. Whatever was already answered still counts
  // (kanji progress + a closed-out session for history), the rest is simply dropped.
  const finalizeAsIncomplete = useCallback(
    async (pending: PendingResume) => {
      try {
        const { items, sessionId } = await resolvePendingItems(pending);
        const answered = items.filter((item) => item.status !== 'idle');

        if (answered.length > 0) {
          const deltas = computeProgressionDeltas(answered);
          // Mastery is a per-kanji event, independent of whether the session itself was
          // completed — unlike the "finished a session" mission tasks, not granted here
          const justMasteredAKanji = hasNewlyMasteredKanji(deltas, progressionState);
          deltas.forEach((delta) => dispatch(user.actions.updateProgression(delta)));
          const points = deltas.filter((delta) => delta.correct).length;
          if (points > 0) dispatch(user.actions.addScore(points));
          await dispatch(syncKanjiProgression());

          if (userId && justMasteredAKanji) {
            dispatch(completeMissionTask({ userId, task: 'kanjiMastery' }));
          }

          if (sessionId) {
            const correctCount = answered.filter((item) => getEffectiveStatus(item) === 'correct').length;
            core.sessionsService!.finish(sessionId, correctCount).catch(() => undefined);
          }
        }
      } catch {
        // Best-effort: even if the partial save fails, the pending run is still discarded below
      } finally {
        await clearLocalSession();
      }
    },
    [dispatch, resolvePendingItems, userId, progressionState],
  );

  const startSession = useCallback(async () => {
    setIsChecking(true);

    // A locally suspended run always wins: it survives regardless of connectivity, and starting
    // another one on top of it would abandon progress the server may not even know about yet
    const localPending: PendingLocalSession | null = await fileServiceInstance.read(fileNames.PENDING_KANJI_SESSION);
    let pending: PendingResume | null =
      localPending && localPending.items.length > 0 ? { source: 'local', session: localPending } : null;

    if (!pending) {
      const action = await dispatch(checkActiveSession());
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

    void dispatch(startFreshSession({ kanjis: kanjiQueue() }));
    setIsChecking(false);
  }, [dispatch, kanjiQueue, isPremium, finalizeAsIncomplete]);

  useEffect(() => {
    if (!isKanjiPoolReady) return;
    void startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKanjiPoolReady]);

  const handleResume = useCallback(async () => {
    if (!pendingResume) return;

    const { items, sessionId } = await resolvePendingItems(pendingResume);
    dispatch(hydrateItems({ items, currentIndex: pendingResume.session.currentIndex, sessionId }));
    setPendingResume(null);
  }, [pendingResume, dispatch, resolvePendingItems]);

  const handleStartOver = useCallback(() => {
    const abandonSessionId = pendingResume?.session.sessionId ?? undefined;
    void dispatch(startFreshSession({ kanjis: kanjiQueue(), abandonSessionId }));
    setPendingResume(null);
  }, [dispatch, kanjiQueue, pendingResume]);

  if (!isModelLoaded || !isKanjiPoolReady || isChecking) {
    return <Layout screen="evaluation" loadingMessage={t('evaluation.loadingModel')} />;
  }

  if (pendingResume) {
    return (
      <Layout screen="evaluation">
        <View center flex>
          <Text text70BO center>
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

  if (evaluationStatus === 'failed') {
    return (
      <Layout screen="evaluation">
        <View center flex>
          <Text text70BO center>
            {t('evaluation.error.title')}
          </Text>
          <Spacing y={8} />
          <Text text80M $textGeneral center>
            {t('evaluation.error.message')}
          </Text>
          <Spacing y={20} />
          <Button label={t('evaluation.error.retry')} onPress={startSession} />
        </View>
      </Layout>
    );
  }

  if (evaluationItems.length === 0) return <Layout screen="evaluation" loadingMessage={t('loading.title')} />;

  return <EvaluationScreen />;
}
