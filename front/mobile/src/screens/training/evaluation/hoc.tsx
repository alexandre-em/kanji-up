import { load } from '@kanjiup/recognition';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import { Button, Colors, Text, View } from 'react-native-ui-lib';

import Layout from '../../../components/layout';
import Spacing from '../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { core } from '../../../services/http';
import {
  checkActiveSession,
  hydrateFromSession,
  selectEvaluationItems,
  selectEvaluationStatus,
  startFreshSession,
} from '../../../store/slices/evaluation';
import { selectSelectedKanji } from '../../../store/slices/selectedKanji';
import EvaluationScreen from '.';

const numberKanji = 20;

export default function EvaluationHoc() {
  const kanjis = useAppSelector(selectSelectedKanji);
  const evaluationItems = useAppSelector(selectEvaluationItems);
  const evaluationStatus = useAppSelector(selectEvaluationStatus);
  const dispatch = useAppDispatch();
  const [isModelLoaded, setModelLoaded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pendingResume, setPendingResume] = useState<SessionType | null>(null);
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

  const startSession = useCallback(() => {
    setIsChecking(true);
    dispatch(checkActiveSession()).then((action) => {
      const session = checkActiveSession.fulfilled.match(action) ? action.payload : null;

      if (session) {
        setPendingResume(session);
      } else {
        void dispatch(startFreshSession({ kanjis: kanjiQueue() }));
      }
      setIsChecking(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResume = useCallback(async () => {
    if (!pendingResume) return;

    const kanjiResults = await Promise.all(
      pendingResume.questions.map((question) => core.kanjiService!.getOne({ id: (question as KanjiSessionQuestion).kanjiId })),
    );
    dispatch(hydrateFromSession({ session: pendingResume, kanjis: kanjiResults.map((result) => result.data) }));
    setPendingResume(null);
  }, [pendingResume, dispatch]);

  const handleStartOver = useCallback(() => {
    void dispatch(startFreshSession({ kanjis: kanjiQueue(), abandonSessionId: pendingResume?.sessionId }));
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
