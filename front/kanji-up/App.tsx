import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';

import Onboarding from './src/components/Onboarding';

export default function App() {
  return (
    <SafeAreaView>
      <StatusBar hidden />
      <Onboarding />
    </SafeAreaView>
  );
}

