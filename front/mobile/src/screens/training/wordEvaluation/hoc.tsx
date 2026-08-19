import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Layout from '../../../components/layout';
import { useRecognitionModel } from '../../../hooks/useRecognitionModel';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { getOne, selectEntities } from '../../../store/slices/kanji';
import { selectActiveList } from '../../../store/slices/lists';
import { init } from '../../../store/slices/wordEvaluation';
import WordEvaluationScreen from '.';

const NUMBER_OF_WORDS = 10;

export default function WordEvaluationHoc() {
  const dispatch = useAppDispatch();
  const activeList = useAppSelector(selectActiveList);
  const kanjiEntities = useAppSelector(selectEntities);
  const { isLoaded: isModelLoaded, hasError: modelLoadError } = useRecognitionModel();
  const toast = useToaster();
  const { t } = useTranslation();

  useEffect(() => {
    if (modelLoadError) toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
  }, [modelLoadError, toast]);

  // The active list only stores kanji_ids — fetch whichever ones aren't already cached before
  // init() can derive practice words from their characters (also needed for stroke-count checks
  // during the run itself, see updateItemSlots in the wordEvaluation slice)
  useEffect(() => {
    activeList?.kanjiIds.forEach((id) => {
      if (!kanjiEntities[id]) dispatch(getOne(id));
    });
  }, [activeList, kanjiEntities, dispatch]);

  const isKanjiPoolReady = !!activeList && activeList.kanjiIds.every((id) => !!kanjiEntities[id]);

  useEffect(() => {
    if (!isKanjiPoolReady) return;
    void dispatch(init({ number: NUMBER_OF_WORDS }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKanjiPoolReady]);

  if (!isModelLoaded || !isKanjiPoolReady)
    return <Layout screen="wordEvaluation" loadingMessage={t('evaluation.loadingModel')} />;

  return <WordEvaluationScreen />;
}
