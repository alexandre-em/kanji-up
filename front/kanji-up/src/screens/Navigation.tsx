import React, {useCallback, useEffect, useState} from 'react';
import { Platform, View } from 'react-native';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator, Snackbar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import * as Linking from 'expo-linking';

import {asyncstorageKeys} from '../constants';
import OnboardingScreen from './Onboarding';
import HomeScreen from './Home';
import CategoryScreen from './Category';
import KanjiListScreen from './KanjiList';
import KanjiDetailScreen from './KanjiDetail';
import SettingScreen from './Settings';
import FlashcardScreen from './Flashcard';
import SearchScreen from './Search';
import {fileNames, readFile} from '../service/file';
import {kanji, error, settings} from '../store/slices';
import {RootState} from '../store';
import {RootStackParamList} from '../types/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const config = {
  screens: {
    Home: {
      path: 'home',
    },
  }
};
const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [Linking.createURL('/')],
  config,
};

export default function Navigation() {
  const dispatch = useDispatch();
  const errorState = useSelector((state: RootState) => state.error);
  const [isFirstTime, setIsFirstTime] = useState<boolean>();

  const loadSelectedKanji = useCallback(async () => {
    try {
      const contents = await readFile(fileNames.SELECTED_KANJI);
      dispatch(kanji.actions.initialize(contents));
    } catch (err) {
      dispatch(error.actions.update({ message: err instanceof Error ? err.message : 'An error occurred' }));
      dispatch(kanji.actions.updateStatus('error'));
    }
  }, []);

  const handleCloseSnack = useCallback(async () => {
    if (error) {
      dispatch(error.actions.reset());
    }
  }, [error]);

  useEffect(() => {
    loadSelectedKanji();
    AsyncStorage.getItem(asyncstorageKeys.FIRST_TIME)
      .then((res) => {
        if (res !== null) {
          const firstTime = JSON.parse(res as string);
          setIsFirstTime(firstTime);
          if (!firstTime) {
            readFile('userSettings')
              .then((content) => dispatch(settings.actions.update(JSON.parse(content))))
              .catch(() => dispatch(error.actions.update({ message: "Could not load user data" })))
          }
        } else { setIsFirstTime(true); }
      })
      .catch(console.error);
  }, []);

  if (isFirstTime === undefined) {
    return (<View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator animating />
    </View>);
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName={isFirstTime && Platform.OS !== 'web' ? 'Onboarding' : 'Home'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={'Home'} component={HomeScreen} />
        <Stack.Screen name={'Flashcard'} component={FlashcardScreen} />
        <Stack.Screen name={'Onboarding'} component={OnboardingScreen} />
        <Stack.Screen name={'Category'} component={CategoryScreen} />
        <Stack.Screen name={'KanjiList'} component={KanjiListScreen} />
        <Stack.Screen name={'KanjiDetail'} component={KanjiDetailScreen} />
        <Stack.Screen name={'Search'} component={SearchScreen} />
        <Stack.Screen name={'Settings'} component={SettingScreen} />
      </Stack.Navigator>
      <Snackbar duration={5000} visible={errorState.isErrorTriggered} onDismiss={handleCloseSnack} action={{ label: 'close', onPress: handleCloseSnack }} style={{ backgroundColor: errorState.color }}>{errorState.message}</Snackbar>
    </NavigationContainer>
  );
};
