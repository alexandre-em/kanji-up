import { load } from '@kanjiup/recognition';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import { Button, Colors, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { fileNames, fileServiceInstance } from '../../../services/file';
import { core } from '../../../services/http';
import {
  buildKanjiResults,
  checkActiveSession,
  clearLocalSession,
  EvaluationItemType,
  getEffectiveStatus,
  hydrateItems,
  PendingLocalSession,
  selectEvaluationItems,
  selectEvaluationStatus,
  startFreshSession,
} from '../../../store/slices/evaluation';
import { recordResults } from '../../../store/slices/progression';
import { selectSelectedKanji } from '../../../store/slices/selectedKanji';
import EvaluationScreen from '.';

const numberKanji = 20;

type PendingResume = { source: 'local'; session: PendingLocalSession } | { source: 'server'; session: SessionType };

export default function EvaluationHoc() {
  const kanjis = useAppSelector(selectSelectedKanji);
  const evaluationItems = useAppSelector(selectEvaluationItems);
  const evaluationStatus = useAppSelector(selectEvaluationStatus);
  const isPremium = useAppSelector((state) => state.user.subscriptionPlan === 'premium');
  const dispatch = useAppDispatch();
  const [isModelLoaded, setModelLoaded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pendingResume, setPendingResume] = useState<PendingResume | null>(null);
  const toast = useToaster();
  const { t } = useTranslation();

  const kanjiQueue = useCallback(() => {
    const kanjiValues = Object.values(kanjis);

    if (kanjiValues.length > 0) {
      return Array.from(Array(numberKanji).keys()).map(() => kanjiValues[Math.floor(Math.random() * kanjiValues.length)]);
    }
    return [];
  }, [kanjis]);

  useEffect(() => {
    load()
      .then(() => {
        setModelLoaded(true);
      })
      .catch(() => {
        toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
      });
  }, [toast]);

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
          await dispatch(recordResults(buildKanjiResults(answered)));

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
    [dispatch, resolvePendingItems],
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
    void startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (!isModelLoaded || isChecking)
    return (
      <Layout screen="evaluation" hideBanner>
        <View center>
          <ActivityIndicator color={Colors.$textPrimary} size="large" />
          <Spacing y={10} />
          <Text>Loading kanji recognition model...</Text>
        </View>
      </Layout>
    );

  if (pendingResume) {
    return (
      <Layout screen="evaluation" hideBanner>
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
      <Layout screen="evaluation" hideBanner>
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

  if (evaluationItems.length === 0)
    return (
      <Layout screen="evaluation" hideBanner>
        <View center>
          <ActivityIndicator color={Colors.$textPrimary} size="large" />
        </View>
      </Layout>
    );

  return <EvaluationScreen />;
}
