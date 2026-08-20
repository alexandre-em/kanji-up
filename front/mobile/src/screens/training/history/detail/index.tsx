import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Text } from 'react-native-ui-lib';

import Layout from '../../../../components/layout';
import Spacing from '../../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useStore';
import { EvaluationItemType } from '../../../../store/slices/evaluation';
import { getOne, selectEntities } from '../../../../store/slices/kanji';
import { selectSessionHistoryItems } from '../../../../store/slices/sessionHistory';
import ResultItemRow from '../../components/resultItemRow';
import { useHistoryDetailStyles } from './hooks/useHistoryDetailStyles';

type HistoryDetailProps = RouteParamsProps<{ sessionId: string }>;

export default function HistoryDetail(props: HistoryDetailProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const styles = useHistoryDetailStyles();
  const { sessionId } = props.route.params;
  const itemsByType = useAppSelector(selectSessionHistoryItems);
  const kanjiEntities = useAppSelector(selectEntities);

  // Already fetched by the history list screen — no need to hit the server again for one session
  const session = useMemo(() => itemsByType.kanji.find((s) => s.sessionId === sessionId), [itemsByType.kanji, sessionId]);

  const questions = useMemo(() => (session?.questions ?? []) as KanjiSessionQuestion[], [session]);

  useEffect(() => {
    questions.forEach((question) => {
      if (!kanjiEntities[question.kanjiId]) dispatch(getOne(question.kanjiId));
    });
  }, [questions, kanjiEntities, dispatch]);

  const items: EvaluationItemType[] = useMemo(
    () =>
      questions.map((question) => ({
        kanji: kanjiEntities[question.kanjiId] ?? {},
        score: null,
        status: question.status,
        image: question.image,
        strokesCount: question.strokesCount,
        userConfirmation: question.userConfirmation,
      })),
    [questions, kanjiEntities],
  );

  if (!session) {
    return <Layout screen="historyDetail" errorMessage={t('historyDetail.notFound')} />;
  }

  const date = new Date(session.createdAt).toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Layout screen="historyDetail">
      <Text text70BO $textDefault>
        {date}
      </Text>
      <Spacing y={4} />
      <Text text90M $textNeutral>
        {t(`history.status.${session.status}`)}
      </Text>
      {session.score !== null && (
        <>
          <Spacing y={8} />
          <Text text60BL $textDefault>
            {t('evaluationResult.summary.score', { correct: session.score, total: session.questions.length })}
          </Text>
        </>
      )}
      <Spacing y={16} />
      <RNView style={styles.divider}>
        {items.map((item, index) => (
          <ResultItemRow key={`${item.kanji.kanji_id}-${index}`} item={item} />
        ))}
      </RNView>
    </Layout>
  );
}
