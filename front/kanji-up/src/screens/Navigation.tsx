import React, {useCallback, useEffect, useState} from 'react';
import {Platform, View} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator, Snackbar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';

import AsyncStorageKeys from '../constants/asyncstorageKeys';
import OnboardingScreen from './Onboarding';
import HomeScreen from './Home';
import CategoryScreen from './Category';
import KanjiListScreen from './KanjiList';
import KanjiDetailScreen from './KanjiDetail';
import {fileNames, readFile} from '../service/file';
import {kanji, error} from '../store/slices';
import {RootState} from '../store';
import {RootStackParamList} from '../types/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const dispatch = useDispatch();
  const errorState = useSelector((state: RootState) => state.error);
  const [isFirstTime, setIsFirstTime] = useState<boolean>();

  const loadSelectedKanji = useCallback(async () => {
    try {
      const contents = await readFile(fileNames.SELECTED_KANJI);
      dispatch(kanji.actions.initialize(contents));
    } catch (err) {
      dispatch(error.actions.update(err.message));
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
    </View>);
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isFirstTime && Platform.OS !== 'web' ? 'Onboarding' : 'Home'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={'Home'} component={HomeScreen} />
        <Stack.Screen name={'Onboarding'} component={OnboardingScreen} />
        <Stack.Screen name={'Category'} component={CategoryScreen} />
        <Stack.Screen name={'KanjiList'} component={KanjiListScreen} />
        <Stack.Screen name={'KanjiDetail'} component={KanjiDetailScreen} />
      </Stack.Navigator>
      <Snackbar visible={errorState.isErrorTriggered} onDismiss={() => {}} action={{ label: 'close', onPress: handleCloseSnack }}>{errorState.message}</Snackbar>
    </NavigationContainer>
  );
};

