import { useTranslation } from 'react-i18next';

import { EvaluationItemType } from '../../../../../store/slices/evaluation';

export function useItemMessage(item: EvaluationItemType) {
  const { t } = useTranslation();

  if (item.status === 'correct') return t('evaluationResult.status.correct');

  if (item.status === 'incorrect') {
    if (!item.image) return t('evaluationResult.status.timeout');
    if (item.strokesCount === 0) return t('evaluationResult.status.empty');

    const expectedStrokes = item.kanji.kanji?.strokes;
    return t('evaluationResult.status.wrongStrokes', { expected: expectedStrokes, actual: item.strokesCount });
  }

  // status === 'review'
  if (item.userConfirmation === true) return t('evaluationResult.status.confirmedCorrect');
  if (item.userConfirmation === false) return t('evaluationResult.status.confirmedIncorrect');
  return t('evaluationResult.status.review');
}
