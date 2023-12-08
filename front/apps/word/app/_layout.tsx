import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Provider } from 'react-redux';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import { AuthProvider } from 'kanji-app-auth';
import { ColorProvider } from 'kanji-app-ui';

import { colors } from '../constants/Colors';
import store from 'store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

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
    Roboto: require('../assets/fonts/Roboto-Regular.ttf'),
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf'),
    RobotoBlack: require('../assets/fonts/Roboto-Black.ttf'),
    RobotoThin: require('../assets/fonts/Roboto-Thin.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.warn(error);
      // throw error;
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
      <Provider store={store}>
        <AuthProvider>
          <ColorProvider colors={colors}>
            <Head>
              <title>KanjiUp | Word</title>
              <meta
                name="description"
                content="Learn and memorize Japanese kanji and words with Flashcard, drawing quizz and games"
              />
            </Head>
            <Stack screenOptions={{ headerShown: false }}></Stack>
          </ColorProvider>
        </AuthProvider>
      </Provider>
    </PaperProvider>
  );
}
