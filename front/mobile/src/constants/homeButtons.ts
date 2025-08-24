type HomeButtonsType = {
  textKey: string;
  // icon: unknown;
  screen: string;
  premium: boolean;
};

export const homeMenuButtons: HomeButtonsType[] = [
  {
    textKey: 'home.buttons.selection',
    // icon: require('../assets/selection.png'),
    screen: 'Kanji',
    premium: false,
  },
  {
    textKey: 'home.buttons.ocr',
    // icon: require('../assets/ocr.png'),
    screen: 'Ocr',
    premium: true,
  },
];

export const homePremiumButton: HomeButtonsType = {
  textKey: 'home.buttons.premium',
  // icon: require('../assets/premium.png'),
  screen: 'Premium',
  premium: true,
};
