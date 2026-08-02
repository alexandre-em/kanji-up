import '../i18n';

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, LoaderScreen } from 'react-native-ui-lib';

import AppBannerAd from '../components/bannerAd';
import BottomNavBar, { TAB_BAR_TOTAL_HEIGHT } from '../components/bottomNavBar';
import { screenNames } from '../constants/screens';
import { TAB_VISIBLE_ROUTES } from '../constants/tabs';
import { useIsNotRegistered } from '../hooks/useIsAlreadyRegistered';
import Home from './home';
import KanjiCategoriesScreen from './kanji';
import KanjiDifficulties from './kanji/difficulty';
import KanjiList from './kanji/difficulty/kanjiList';
import KanjiDetail from './kanji/difficulty/kanjiList/kanji';
import Onboarding from './onboarding';
import Search from './search';
import Settings from './settings';
import EvaluationHoc from './training/evaluation/hoc';

const Stack = createNativeStackNavigator();

// Onboarding (first launch, nothing to monetize yet) and Evaluation (full-screen drawing
// session) are the only screens that never show the persistent banner
const BANNER_HIDDEN_ROUTES = [screenNames.ONBOARDING, screenNames.EVALUATION];

const headerOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: Colors.$backgroundPrimaryHeavy,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold' as 'bold',
  },
};

export default function RootNavigation() {
  const { t } = useTranslation();
  const isNotRegistered = useIsNotRegistered();
  const insets = useSafeAreaInsets();
  // The tab bar lives outside the navigator, so it reads/drives navigation through the container ref
  const navigationRef = useNavigationContainerRef();
  const [activeRoute, setActiveRoute] = useState<string | undefined>();

  const handleRouteChange = useCallback(() => {
    setActiveRoute(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  const handleTabPress = useCallback(
    (route: string) => {
      navigationRef.navigate(route as never);
    },
    [navigationRef],
  );

  // Handle loading state if hooks are still resolving
  if (isNotRegistered === undefined) {
    return <LoaderScreen message={t('home.loading.title')} />;
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={handleRouteChange} onStateChange={handleRouteChange}>
      <View style={styles.container}>
        <Stack.Navigator initialRouteName={isNotRegistered ? 'Onboarding' : 'Home'} screenOptions={{ headerShown: false }}>
          <Stack.Screen name={screenNames.ONBOARDING} component={Onboarding} />
          <Stack.Screen name={screenNames.HOME} component={Home} />
          <Stack.Screen name={screenNames.EVALUATION} component={EvaluationHoc} options={headerOptions} />
          <Stack.Screen name={screenNames.SEARCH} component={Search} />
          <Stack.Screen name={screenNames.CATEGORIES} component={KanjiCategoriesScreen} />
          <Stack.Screen name={screenNames.DIFFICULTIES} component={KanjiDifficulties} />
          <Stack.Screen name={screenNames.KANJIS} component={KanjiList} />
          <Stack.Screen name={screenNames.KANJI} component={KanjiDetail} options={headerOptions} />
          <Stack.Screen name={screenNames.SETTINGS} component={Settings} />
        </Stack.Navigator>
        {activeRoute && !BANNER_HIDDEN_ROUTES.includes(activeRoute) && (
          <AppBannerAd
            style={[
              styles.banner,
              { bottom: (TAB_VISIBLE_ROUTES.includes(activeRoute) ? TAB_BAR_TOTAL_HEIGHT : 0) + insets.bottom },
            ]}
          />
        )}
        {activeRoute && TAB_VISIBLE_ROUTES.includes(activeRoute) && (
          <BottomNavBar activeRoute={activeRoute} onTabPress={handleTabPress} />
        )}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
