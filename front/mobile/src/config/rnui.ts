import { Assets } from 'react-native-ui-lib';
import { Colors, ThemeManager, Typography } from 'react-native-ui-lib';
import { setConfig } from 'react-native-ui-lib/config';

import AddIcon from '../assets/icons/add.png';
import CheckIcon from '../assets/icons/check.png';
import SelectionIcon from '../assets/icons/checkbox.png';
import ClearIcon from '../assets/icons/clear.png';
import CrossIcon from '../assets/icons/cross.png';
import CoinIcon from '../assets/icons/diamond.png';
import DownIcon from '../assets/icons/down.png';
import DrawIcon from '../assets/icons/draw.png';
import GoogleIcon from '../assets/icons/google.png';
import PremiumIcon from '../assets/icons/premium.png';
import RecognitionIcon from '../assets/icons/recognition.png';
import RemoveIcon from '../assets/icons/remove.png';
import SettingIcon from '../assets/icons/setting.png';
import TimerIcon from '../assets/icons/timer.png';
import UpIcon from '../assets/icons/up.png';
import VideoIcon from '../assets/icons/video.png';
import YenIcon from '../assets/icons/yen.png';
import SchoolBanner from '../assets/images/hiroyoshi-urushima-school.jpg';
import SchoolBannerDisabled from '../assets/images/hiroyoshi-urushima-school-disabled.jpg';
import AdvancedBanner from '../assets/images/marco-zuppone-advanced.jpg';
import AdvancedBannerDisabled from '../assets/images/marco-zuppone-advanced-disabled.jpg';
import JlptBanner from '../assets/images/nguyen-dang-hoang-nhu-jlpt.jpg';
import PremiumBanner from '../assets/images/remi-bertogliati-premium.jpg';

setConfig({ appScheme: 'default' });

Assets.loadAssetsGroup('icons', {
  add: AddIcon,
  check: CheckIcon,
  coin: CoinIcon,
  clear: ClearIcon,
  cross: CrossIcon,
  google: GoogleIcon,
  premium: PremiumIcon,
  recognition: RecognitionIcon,
  selection: SelectionIcon,
  draw: DrawIcon,
  remove: RemoveIcon,
  yen: YenIcon,
  video: VideoIcon,
  setting: SettingIcon,
  up: UpIcon,
  down: DownIcon,
  timer: TimerIcon,
});

Assets.loadAssetsGroup('banners', {
  advanced: AdvancedBanner,
  advancedDisabled: AdvancedBannerDisabled,
  premium: PremiumBanner,
  school: SchoolBanner,
  schoolDisabled: SchoolBannerDisabled,
  jlpt: JlptBanner,
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
    // Softened from a near-black #191010: this is RNUI's implicit fallback outline for many
    // components (e.g. SegmentedControl), so a dark value here read as a harsh, dated border
    // anywhere a component didn't get an explicit override
    $outlineDefault: '#d8d9dc',
    $outlinePrimary: '#d42528',
    $outlinePrimaryMedium: '#f7d4d4',
    $outlineGeneral: '#7e2526',
    // Status colors: 'incorrect' reuses the brand red above, these two cover the other verdicts
    $backgroundSuccessLight: '#e3f6ea',
    $textSuccess: '#1f9254',
    $iconSuccess: '#1f9254',
    $backgroundWarningLight: '#fdf0d5',
    $textWarning: '#b06f00',
    $iconWarning: '#b06f00',
    // True grey, no red tint — distinct from $textGeneral/$backgroundGeneral*, which stay a dark
    // brand red for secondary brand accents. This is for anything that should read as neutral:
    // track backgrounds, card borders, secondary text/icons.
    $backgroundNeutralLight: '#f1f2f4',
    $backgroundNeutralMedium: '#e4e6e9',
    $backgroundNeutralHeavy: '#c7cad0',
    $textNeutral: '#6b7280',
    $iconNeutral: '#6b7280',
    $outlineNeutral: '#e2e4e8',
  },
  dark: {
    // Lifted off true black: a pure #060504 read as harsh/OLED-test-pattern rather than premium
    $backgroundDefault: '#121110',
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
    // Softened from a near-white #efe6e6, same reasoning as the light scheme's fix: too stark
    // as an implicit fallback border against a now-dark-charcoal background
    $outlineDefault: '#3a3835',
    $outlinePrimary: '#e87d7f',
    $outlinePrimaryMedium: '#821719',
    $outlineGeneral: '#c6393c',
    $backgroundSuccessLight: '#123822',
    $textSuccess: '#4ade80',
    $iconSuccess: '#4ade80',
    $backgroundWarningLight: '#4a3510',
    $textWarning: '#f5b942',
    $iconWarning: '#f5b942',
    $backgroundNeutralLight: '#1c1b1a',
    $backgroundNeutralMedium: '#2a2927',
    $backgroundNeutralHeavy: '#3d3b38',
    $textNeutral: '#9a9a9a',
    $iconNeutral: '#9a9a9a',
    $outlineNeutral: '#33322f',
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
