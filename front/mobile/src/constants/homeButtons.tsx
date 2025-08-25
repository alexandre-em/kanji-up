import React, { ReactNode } from 'react';
import { Assets, Colors, Icon } from 'react-native-ui-lib';

type HomeButtonsType = {
  textKey: string;
  subtitle?: string;
  icon?: ReactNode;
  screen: string;
  premium: boolean;
  hide?: boolean;
};

export const homeMenuButtons: HomeButtonsType[] = [
  {
    textKey: 'home.menu.selection.title',
    subtitle: 'home.menu.selection.subtitle',
    icon: <Icon source={Assets.icons.selection} size={36} tintColor={Colors.$textPrimary} />,
    screen: 'Kanji',
    premium: false,
  },
  {
    textKey: 'home.menu.ocr.title',
    subtitle: 'home.menu.ocr.subtitle',
    icon: <Icon source={Assets.icons.recognition} size={36} tintColor={Colors.$textPrimary} />,
    screen: 'Ocr',
    premium: true,
  },
];

export const homePremiumButton: HomeButtonsType = {
  textKey: 'home.buttons.premium',
  subtitle: 'home.menu.premium.subtitle',
  screen: 'Premium',
  premium: true,
};
