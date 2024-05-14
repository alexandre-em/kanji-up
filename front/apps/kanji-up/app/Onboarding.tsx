import { router } from 'expo-router';
import { SafeAreaView } from 'react-native';
import React, { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { asyncstorageKeys } from 'kanji-app-auth';
import Onboarding from 'kanji-app-onboarding';

import { colors } from '../constants';
import data from '../constants/onboarding';
import global from '../styles/global';

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
