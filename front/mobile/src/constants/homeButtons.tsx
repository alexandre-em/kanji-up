import React, { ReactNode } from 'react';
import { Assets, Colors, Icon } from 'react-native-ui-lib';

import { screenNames } from './screens';

type HomeButtonsType = {
  textKey: string;
  subtitle?: string;
  icon?: ReactNode;
  screen: string;
  premium: boolean;
  hide?: boolean;
  /** Needs a live network call to be useful — greyed out with an offline badge when offline */
  requiresNetwork?: boolean;
};

export const homeMenuButtons: HomeButtonsType[] = [
  {
    textKey: 'home.menu.selection.title',
    subtitle: 'home.menu.selection.subtitle',
    icon: <Icon source={Assets.icons.selection} size={36} tintColor={Colors.$textPrimary} />,
    screen: screenNames.CATEGORIES,
    premium: false,
    requiresNetwork: true,
  },
  {
    textKey: 'home.menu.ocr.title',
    subtitle: 'home.menu.ocr.subtitle',
    icon: <Icon source={Assets.icons.recognition} size={36} tintColor={Colors.$textPrimary} />,
    screen: screenNames.OCR,
    premium: true,
    requiresNetwork: true,
  },
];

export const homePremiumButton: HomeButtonsType = {
  textKey: 'home.buttons.premium',
  subtitle: 'home.menu.premium.subtitle',
  screen: screenNames.PREMIUM,
  premium: true,
};
