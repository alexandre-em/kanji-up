import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View as RNView } from 'react-native';
import { Text } from 'react-native-ui-lib';

import Layout from '../../../../components/layout';
import Spacing from '../../../../components/spacing';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useStore';
import { EvaluationItemType } from '../../../../store/slices/evaluation';
import { getOne, selectEntities } from '../../../../store/slices/kanji';
import { selectSessionHistoryItems } from '../../../../store/slices/sessionHistory';
import { getOne as getOneWord, selectGetOne as selectWordEntities } from '../../../../store/slices/word';
import { WordEvaluationItemType } from '../../../../store/slices/wordEvaluation';
import ResultItemRow from '../../components/resultItemRow';
import WordResultItemRow from '../../wordEvaluation/result/components/resultItemRow';
import WordReviewModal from '../../wordEvaluation/result/components/reviewModal';
import { useHistoryDetailStyles } from './hooks/useHistoryDetailStyles';

type HistoryDetailProps = RouteParamsProps<{ sessionId: string; type: SessionKind }>;

export default function HistoryDetail(props: HistoryDetailProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const styles = useHistoryDetailStyles();
  const { sessionId, type } = props.route.params;
  const itemsByType = useAppSelector(selectSessionHistoryItems);
  const kanjiEntities = useAppSelector(selectEntities);
  const wordEntities = useAppSelector(selectWordEntities);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  // Already fetched by the history list screen — no need to hit the server again for one session
  const session = useMemo(() => itemsByType[type].find((s) => s.sessionId === sessionId), [itemsByType, type, sessionId]);

  const kanjiQuestions = useMemo(
    () => (type === 'kanji' ? ((session?.questions ?? []) as KanjiSessionQuestion[]) : []),
    [session, type],
  );
  const wordQuestions = useMemo(
    () => (type === 'word' ? ((session?.questions ?? []) as WordSessionQuestion[]) : []),
    [session, type],
  );

  useEffect(() => {
    kanjiQuestions.forEach((question) => {
      if (!kanjiEntities[question.kanjiId]) dispatch(getOne(question.kanjiId));
    });
  }, [kanjiQuestions, kanjiEntities, dispatch]);

  useEffect(() => {
    wordQuestions.forEach((question) => {
      if (!wordEntities[question.wordId]) dispatch(getOneWord(question.wordId));
    });
  }, [wordQuestions, wordEntities, dispatch]);

  const kanjiItems: EvaluationItemType[] = useMemo(
    () =>
      kanjiQuestions.map((question) => ({
        kanji: kanjiEntities[question.kanjiId] ?? {},
        score: null,
        status: question.status,
        image: question.image,
        strokesCount: question.strokesCount,
        userConfirmation: question.userConfirmation,
      })),
    [kanjiQuestions, kanjiEntities],
  );

  const wordItems: WordEvaluationItemType[] = useMemo(
    () =>
      wordQuestions.map((question) => ({
        word: wordEntities[question.wordId] ?? {},
        slots: question.slots,
        status: question.status,
        userConfirmation: question.userConfirmation,
      })),
    [wordQuestions, wordEntities],
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
        {type === 'kanji'
          ? kanjiItems.map((item, index) => <ResultItemRow key={`${item.kanji.kanji_id}-${index}`} item={item} />)
          : wordItems.map((item, index) => (
              <WordResultItemRow key={`${item.word.word_id}-${index}`} item={item} onPress={() => setActiveWordIndex(index)} />
            ))}
      </RNView>
      <WordReviewModal
        item={activeWordIndex !== null ? wordItems[activeWordIndex] : undefined}
        position={0}
        total={0}
        onChoose={() => undefined}
        onClose={() => setActiveWordIndex(null)}
      />
    </Layout>
  );
}
