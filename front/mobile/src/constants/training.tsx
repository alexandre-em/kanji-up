import { ReactNode } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Assets, Image } from 'react-native-ui-lib';

import { screenNames } from './screens';
import { GENERAL_MARGIN } from './styles';

export type TrainingModeType = {
  textKey: string;
  subtitle: string;
  screen: string;
  image: ReactNode;
  comingSoon?: boolean;
  // Modes that don't draw from a selected-kanji list (e.g. a history viewer) skip the
  // choose-a-list prompt entirely and navigate straight through
  skipListPicker?: boolean;
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
  // Sits between the photo (zIndex -10) and the text (default stacking) — a photo can be light
  // enough to wash out white overlay text otherwise, this guarantees contrast regardless
  bannerScrim: {
    position: 'absolute',
    left: 0,
    zIndex: -5,
    width: width - GENERAL_MARGIN * 2,
    height: 105,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});

const BannerScrim = () => <View style={styles.bannerScrim} />;

export const trainingModes: TrainingModeType[] = [
  {
    textKey: 'training.menu.flashcards.title',
    subtitle: 'training.menu.flashcards.subtitle',
    screen: screenNames.FLASHCARDS,
    // The list to draw from now depends on the Kanji/Mots toggle inside the flashcards screen
    // itself, so the choice happens there instead of upfront
    skipListPicker: true,
    image: (
      <>
        <Image source={Assets.banners.flashcards} style={styles.bannerImage} />
        <BannerScrim />
      </>
    ),
  },
  {
    textKey: 'training.menu.kanji.title',
    subtitle: 'training.menu.kanji.subtitle',
    screen: screenNames.EVALUATION,
    image: (
      <>
        <Image source={Assets.banners.kanjiTest} style={styles.bannerImage} />
        <BannerScrim />
      </>
    ),
  },
  {
    textKey: 'training.menu.word.title',
    subtitle: 'training.menu.word.subtitle',
    screen: screenNames.WORD_EVALUATION,
    // Pool source now depends on the Kanji/Mots toggle inside the mode's own screen, same
    // reasoning as flashcards — the choice happens there instead of upfront
    skipListPicker: true,
    image: (
      <>
        <Image source={Assets.banners.wordTest} style={styles.bannerImage} />
        <BannerScrim />
      </>
    ),
  },
  {
    textKey: 'training.menu.history.title',
    subtitle: 'training.menu.history.subtitle',
    screen: screenNames.HISTORY,
    skipListPicker: true,
    image: (
      <>
        <Image source={Assets.banners.jlpt} style={styles.bannerImage} />
        <BannerScrim />
      </>
    ),
  },
];
