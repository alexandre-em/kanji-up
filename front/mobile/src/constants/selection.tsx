import { Dimensions, StyleSheet } from 'react-native';
import { Assets, Card, Image } from 'react-native-ui-lib';

import { GENERAL_MARGIN } from './styles';

type SelectionButtonsType = {
  textKey: string;
  subtitle?: string;
  image: React.ReactNode;
  disabledImage?: React.ReactNode;
  screen: string;
  premium: boolean;
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  bannerImage: {
    position: 'absolute',
    left: 0,
    zIndex: -10,
    width: width - GENERAL_MARGIN * 2,
    height: 105,
    borderRadius: 10,
  },
  smallBannerImage: {
    width: 105,
    height: 105,
    borderRadius: 10,
  },
});

export const selectionMenuButtons: SelectionButtonsType[] = [
  {
    textKey: 'selection.menu.jlpt.title',
    subtitle: 'selection.menu.jlpt.subtitle',
    image: <Image source={Assets.banners.jlpt} style={styles.bannerImage} />,
    screen: 'jlpt',
    premium: false,
  },
  {
    textKey: 'selection.menu.school.title',
    subtitle: 'selection.menu.school.subtitle',
    image: <Image source={Assets.banners.school} style={styles.bannerImage} />,
    screen: 'grade',
    premium: false,
  },
  {
    textKey: 'selection.menu.advanced.title',
    subtitle: 'selection.menu.advanced.subtitle',
    image: <Image source={Assets.banners.advanced} style={styles.bannerImage} />,
    disabledImage: <Image source={Assets.banners.advancedDisabled} style={styles.bannerImage} />,
    screen: 'advanced',
    premium: true,
  },
];

export const jlptDifficulties = [
  {
    textKey: 'difficulties.jlpt.level5.title',
    subtitle: `difficulties.jlpt.unit`,
    screen: '5',
    count: 80,
    image: <Card.Image source={Assets.banners.jlpt} style={styles.smallBannerImage} />,
  },
  {
    textKey: 'difficulties.jlpt.level4.title',
    subtitle: `difficulties.jlpt.unit`,
    screen: '4',
    count: 170,
    image: <Card.Image source={Assets.banners.jlpt} style={styles.smallBannerImage} />,
  },
  {
    textKey: 'difficulties.jlpt.level3.title',
    subtitle: `difficulties.jlpt.unit`,
    screen: '3',
    count: 370,
    image: <Card.Image source={Assets.banners.jlpt} style={styles.smallBannerImage} />,
  },
  {
    textKey: 'difficulties.jlpt.level2.title',
    subtitle: `difficulties.jlpt.unit`,
    screen: '2',
    count: 380,
    image: <Card.Image source={Assets.banners.jlpt} style={styles.smallBannerImage} />,
  },
  {
    textKey: 'difficulties.jlpt.level1.title',
    subtitle: `difficulties.jlpt.unit`,
    screen: '1',
    count: 1136,
    image: <Card.Image source={Assets.banners.jlpt} style={styles.smallBannerImage} />,
  },
];
