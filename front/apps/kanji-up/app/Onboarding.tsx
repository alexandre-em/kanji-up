import { SafeAreaView } from 'react-native';
import React, { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { asyncstorageKeys } from 'kanji-app-auth';
import Onboarding from 'kanji-app-onboarding';

import global from 'styles/global';
import { colors } from 'constants';

const data = [
  {
    id: '0',
    title: 'App navigation',
    subtitle:
      'Passed the Onboarding screen, you will be redirect on the home screen where you can navigate between screens like kanji list, search, settings by clicking on the image profile (top-right)',
    image: require('assets/images/home.png'),
  },
  {
    id: '1',
    title: 'Select kanji',
    subtitle:
      'Select the kanji you to practice by doing flashcard/drawing quizzes. To enter into select mode, you will have to press on the button on top-right of the screen then on the same menu, to save your selection',
    image: require('assets/images/select.png'),
  },
  {
    id: '2',
    title: 'Kanji details',
    subtitle:
      "You can also see the kanji character's details with an animated image to show you how to draw it with the order and the number of strokes but also the readings and the meanings with some examples",
    image: require('assets/images/detail.png'),
  },
  {
    id: '3',
    title: 'Settings',
    subtitle:
      'Do not forget to configure your application to define the number of flashcard, drawing quizzes but also to edit your user profile',
    image: require('assets/images/settings.png'),
  },
  {
    id: '4',
    title: 'Flashcard/Drawing Quizz',
    subtitle: "You can now test your kanji's knowledge by begining with flashcard and then practice your writting skills",
    image: require('assets/images/draw.png'),
  },
  {
    id: '5',
    title: 'Server status',
    subtitle:
      'Before running a set of drawing quizz, please do not forget to check the server status. If the server is down it will shows a grey icon. But if it is available, it will be green.',
    image: require('assets/images/reco_offline.png'),
  },
];
export default function OnboardingScreen() {
  const onFinish = useCallback(() => {
    AsyncStorage.setItem(asyncstorageKeys.FIRST_TIME, 'done');
    router.replace('/home');
  }, []);

  return (
    <SafeAreaView style={global.main}>
      <Onboarding data={data} onFinish={onFinish} colors={colors} />
    </SafeAreaView>
  );
}
