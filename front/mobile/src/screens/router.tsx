import '../i18n';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import { LoaderScreen } from 'react-native-ui-lib';

import { useIsAlreadyRegistered, useIsNotRegistered } from '../hooks/useIsAlreadyRegistered';
import Home from './home';
import Onboarding from './onboarding';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { t } = useTranslation();
  const isRegistered = useIsAlreadyRegistered();
  const isNotRegistered = useIsNotRegistered();

  // Handle loading state if hooks are still resolving
  if (isRegistered === undefined && isNotRegistered === undefined) {
    return <LoaderScreen message={t('home.loading.title')} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator defaultScreenName={isNotRegistered ? 'Onboarding' : 'Home'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
