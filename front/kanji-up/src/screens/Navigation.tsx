import React, {useEffect, useState} from 'react';
import {Platform, View} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native-paper';

import AsyncStorageKeys from '../constants/asyncstorageKeys';
import OnboardingScreen from './Onboarding';
import HomeScreen from './Home';
import CategoryScreen from './Category';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const [isFirstTime, setIsFirstTime] = useState<boolean>();

  useEffect(() => {
    AsyncStorage.getItem(AsyncStorageKeys.FIRST_TIME)
      .then((res) => {
      if (res !== null) {
          setIsFirstTime(JSON.parse(res as string));
        } else { setIsFirstTime(true); }
      })
      .catch(console.error);
  }, []);

  if (isFirstTime === undefined) {
    return (<View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator animating />
    </View>)
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isFirstTime && Platform.OS !== 'web' ? 'Onboarding' : 'Category'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={'Home'} component={HomeScreen} />
        <Stack.Screen name={'Onboarding'} component={OnboardingScreen} />
        <Stack.Screen name={'Category'} component={CategoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

