import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Colors, Switch, Text, View } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import Spacing from '../../../components/spacing';
import { useAppDispatch } from '../../../hooks/useStore';
import { selectTrainingConsent, user } from '../../../store/slices/user';
import { StepProps } from '..';

export default function Step4({ step }: StepProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const trainingConsent = useSelector(selectTrainingConsent);

  const handleToggle = useCallback(
    (value: boolean) => {
      dispatch(user.actions.update({ trainingConsent: value }));
    },
    [dispatch],
  );

  if (step !== 3) return null;

  return (
    <View height="90%" paddingT-50 centerH>
      <Text h2 $textDefault center marginB-10>
        {t('onboarding.consent.title')}
      </Text>
      <Text h4 $textNeutral center marginB-30>
        {t('onboarding.consent.subtitle')}
      </Text>
      <View row centerV width="100%" spread paddingH-10>
        <Text text70M $textDefault flex>
          {t('onboarding.consent.toggle.label')}
        </Text>
        <Spacing x={12} />
        <Switch value={trainingConsent} onValueChange={handleToggle} onColor={Colors.$backgroundPrimaryHeavy} />
      </View>
    </View>
  );
}
