import { Assets } from 'react-native-ui-lib';
import { Colors, ThemeManager, Typography } from 'react-native-ui-lib';
import { setConfig } from 'react-native-ui-lib/config';

import SelectionIcon from '../assets/icons/checkbox.png';
import CoinIcon from '../assets/icons/diamond.png';
import DrawIcon from '../assets/icons/draw.png';
import GoogleIcon from '../assets/icons/google.png';
import PremiumIcon from '../assets/icons/premium.png';
import RecognitionIcon from '../assets/icons/recognition.png';
import SettingIcon from '../assets/icons/setting.png';
import VideoIcon from '../assets/icons/video.png';
import YenIcon from '../assets/icons/yen.png';
import PremiumBanner from '../assets/images/remi-bertogliati-premium.jpg';

setConfig({ appScheme: 'default' });

Assets.loadAssetsGroup('icons', {
  coin: CoinIcon,
  google: GoogleIcon,
  premium: PremiumIcon,
  recognition: RecognitionIcon,
  selection: SelectionIcon,
  draw: DrawIcon,
  yen: YenIcon,
  video: VideoIcon,
  setting: SettingIcon,
});

Assets.loadAssetsGroup('banners', {
  premium: PremiumBanner,
});

Colors.loadSchemes({
  light: {
    $backgroundDefault: '#f9fafb',
    $backgroundPrimaryHeavy: '#d42528',
    $backgroundPrimaryMedium: '#f7d4d4',
    $backgroundPrimaryLight: '#fbe9ea',
    $backgroundGeneralHeavy: '#7e2526',
    $backgroundGeneralMedium: '#dd888a',
    $backgroundGeneralLight: '#f4d7d8',
    $textDefault: '#191010',
    $textPrimary: '#d42528',
    $textGeneral: '#7e2526',
    $textMajor: '#c92c2f',
    $iconDefaultLight: '#191010',
    $iconPrimary: '#d42528',
    $iconPrimaryLight: '#f7d4d4',
    $iconGeneral: '#7e2526',
    $iconGeneralLight: '#dd888a',
    $outlineDefault: '#191010',
    $outlinePrimary: '#d42528',
    $outlinePrimaryMedium: '#f7d4d4',
    $outlineGeneral: '#7e2526',
  },
  dark: {
    $backgroundDefault: '#060504',
    $backgroundPrimaryHeavy: '#e87d7f',
    $backgroundPrimaryMedium: '#821719',
    $backgroundPrimaryLight: '#570f10',
    $backgroundGeneralHeavy: '#c6393c',
    $backgroundGeneralMedium: '#772224',
    $backgroundGeneralLight: '#4f1718',
    $textDefault: '#efe6e6',
    $textPrimary: '#e87d7f',
    $textGeneral: '#c6393c',
    $textMajor: '#d33639',
    $iconDefaultLight: '#efe6e6',
    $iconPrimary: '#e87d7f',
    $iconPrimaryLight: '#570f10',
    $iconGeneral: '#c6393c',
    $iconGeneralLight: '#4f1718',
    $outlineDefault: '#efe6e6',
    $outlinePrimary: '#e87d7f',
    $outlinePrimaryMedium: '#821719',
    $outlineGeneral: '#c6393c',
  },
});

ThemeManager.setComponentTheme('View', () => {
  return {
    backgroundColor: Colors.$backgroundDefault,
  };
});

Typography.loadTypographies({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 25,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 17,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 17,
  },
  h4: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 17,
  },
  h5: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  },
  h6: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 32,
  },
  p1: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
  },
  p2: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
});
