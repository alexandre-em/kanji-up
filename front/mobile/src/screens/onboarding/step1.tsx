import { useTranslation } from 'react-i18next';
import { Colors, Text, View } from 'react-native-ui-lib';

import Welcome from '../../components/svg/welcome';
import { StepProps } from '.';

export default function Step1({ step }: StepProps) {
  const { t } = useTranslation();
  if (step !== 0) return null;

  return (
    <View height="90%" center>
      <Text h1 highlightString="KanjiUp" highlightStyle={{ color: Colors.$textPrimary }} marginB-20>
        {t('onboarding.welcome.title')}
      </Text>
      <Welcome width={300} height={300} />
      <Text
        h4
        center
        highlightString={t('onboarding.welcome.subtitle.highlight')}
        highlightStyle={{ color: Colors.$textPrimary }}>
        {t('onboarding.welcome.subtitle')}
      </Text>
    </View>
  );
}
