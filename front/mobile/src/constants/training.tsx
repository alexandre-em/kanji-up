import { ReactNode } from 'react';
import { Assets, Colors, Icon } from 'react-native-ui-lib';

import { screenNames } from './screens';

export type TrainingModeType = {
  textKey: string;
  subtitle: string;
  screen: string;
  icon: ReactNode;
  comingSoon?: boolean;
};

export const trainingModes: TrainingModeType[] = [
  {
    textKey: 'training.menu.kanji.title',
    subtitle: 'training.menu.kanji.subtitle',
    screen: screenNames.EVALUATION,
    icon: <Icon source={Assets.icons.draw} size={36} tintColor={Colors.$textPrimary} />,
  },
  {
    textKey: 'training.menu.word.title',
    subtitle: 'training.menu.word.subtitle',
    screen: screenNames.WORD_EVALUATION,
    icon: <Icon source={Assets.icons.draw} size={36} tintColor={Colors.$textPrimary} />,
    comingSoon: true,
  },
];
