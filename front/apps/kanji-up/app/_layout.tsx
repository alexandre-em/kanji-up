import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Provider } from 'react-redux';
import { SplashScreen, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import LogRocket from '@logrocket/react-native';

import { AuthProvider } from 'kanji-app-auth';
import { ColorProvider } from 'kanji-app-ui';

import { colors } from '../constants/Colors';
import store from '../store';
import { Platform } from 'react-native';

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

  useEffect(() => {
    LogRocket.init('sogogn/kanji-up');
  }, []);

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

  useEffect(() => {
    if (Platform.OS === 'web') {
      const ua = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(ua)) {
        document.body.style.position = 'fixed';
      }
    }
  }, []);

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
              <title>KanjiUp V2</title>
              <meta name="description" content="Learn and memorize Japanese kanji with Flashcard and drawing quizz" />
              <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png"></link>
              <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"></link>
              <link rel="shortcut icon" href="/favicon.ico"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-640x1136.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-1242x2688.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-828x1792.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-1125x2436.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-1242x2208.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-750x1334.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-2048x2732.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-1668x2388.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-1668x2224.png"></link>
              <link
                rel="apple-touch-startup-image"
                media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                href="/pwa/apple-touch-startup-image/apple-touch-startup-image-1536x2048.png"></link>
              <link rel="manifest" href="/manifest.json"></link>
            </Head>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="Onboarding" options={{ headerShown: false, presentation: 'modal' }} />
            </Stack>
          </ColorProvider>
        </AuthProvider>
      </Provider>
    </PaperProvider>
  );
}
