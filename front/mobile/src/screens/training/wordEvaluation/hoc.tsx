import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Layout from '../../../components/layout';
import { useRecognitionModel } from '../../../hooks/useRecognitionModel';
import { useAppDispatch } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { init } from '../../../store/slices/wordEvaluation';
import WordEvaluationScreen from '.';

const NUMBER_OF_WORDS = 10;

export default function WordEvaluationHoc() {
  const dispatch = useAppDispatch();
  const { isLoaded: isModelLoaded, hasError: modelLoadError } = useRecognitionModel();
  const toast = useToaster();
  const { t } = useTranslation();

  useEffect(() => {
    if (modelLoadError) toast?.show({ message: 'An error occurred when loading the recognition model', type: 'failure' });
  }, [modelLoadError, toast]);

  useEffect(() => {
    void dispatch(init({ number: NUMBER_OF_WORDS }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isModelLoaded) return <Layout screen="wordEvaluation" loadingMessage={t('evaluation.loadingModel')} />;

  return <WordEvaluationScreen />;
}
