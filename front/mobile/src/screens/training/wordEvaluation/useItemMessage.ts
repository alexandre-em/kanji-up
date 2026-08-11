import { useTranslation } from 'react-i18next';

import { getKanjiCharacters, WordEvaluationItemType } from '../../../store/slices/wordEvaluation';

export function useItemMessage(item: WordEvaluationItemType) {
  const { t } = useTranslation();
  const expectedLength = getKanjiCharacters(item.word.word?.[0] ?? '').length;

  if (item.status === 'correct') return t('wordEvaluationResult.status.correct');

  if (item.status === 'incorrect') {
    if (item.slots.length !== expectedLength) {
      return t('wordEvaluationResult.status.wrongLength', { expected: expectedLength, actual: item.slots.length });
    }
    return t('wordEvaluationResult.status.empty');
  }

  if (item.userConfirmation === true) return t('wordEvaluationResult.status.confirmedCorrect');
  if (item.userConfirmation === false) return t('wordEvaluationResult.status.confirmedIncorrect');
  return t('wordEvaluationResult.status.review');
}
