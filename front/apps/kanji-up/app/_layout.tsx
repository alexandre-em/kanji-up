import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Provider } from 'react-redux';
import { SplashScreen, Stack } from 'expo-router';
import { Provider as PaperProvider, DefaultTheme, Portal } from 'react-native-paper';

import { AuthProvider } from 'kanji-app-auth';

import { colors } from '../constants/Colors';
import store from '../store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'home',
};

const theme = {
  ...DefaultTheme,
  roundness: 2,
  version: 3,
  myOwnProperty: true,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.warn(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <PaperProvider theme={theme}>
      <Portal>
        <Provider store={store}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}></Stack>
          </AuthProvider>
        </Provider>
      </Portal>
    </PaperProvider>
  );
}
