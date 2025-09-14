import '../i18n';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { LoaderScreen } from 'react-native-ui-lib';

import { screenNames } from '../constants/screens';
import { useIsNotRegistered } from '../hooks/useIsAlreadyRegistered';
import Evaluation from './evaluation';
import Home from './home';
import KanjiCategoriesScreen from './kanji';
import KanjiDifficulties from './kanji/difficulty';
import KanjiList from './kanji/difficulty/kanjiList';
import Onboarding from './onboarding';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { t } = useTranslation();
  const isNotRegistered = useIsNotRegistered();

  // Handle loading state if hooks are still resolving
  if (isNotRegistered === undefined) {
    return <LoaderScreen message={t('home.loading.title')} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator defaultScreenName={isNotRegistered ? 'Onboarding' : 'Home'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={screenNames.ONBOARDING} component={Onboarding} />
        <Stack.Screen name={screenNames.HOME} component={Home} />
        <Stack.Screen name={screenNames.EVALUATION} component={Evaluation} />
        <Stack.Screen name={screenNames.CATEGORIES} component={KanjiCategoriesScreen} />
        <Stack.Screen name={screenNames.DIFFICULTIES} component={KanjiDifficulties} />
        <Stack.Screen name={screenNames.KANJIS} component={KanjiList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
