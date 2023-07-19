import 'dotenv/config';

export default {
  expo: {
    name: 'kanji-up',
    scheme: 'kanjiup',
    slug: 'kanji-up',
    version: '0.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#851a1b',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      bundleIdentifier: 'com.aem.kanjiup',
      requireFullScreen: true,
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#851a1b',
      },
      package: 'com.aem.kanjiup',
    },
    web: {
      display: 'fullscreen',
      lang: 'en-US',
      favicon: './assets/favicon.png',
    },
    extra: {
      environment: 'production',
      AUTH_BASE_URL: process.env.AUTH_BASE_URL ?? 'http://localhost:3000',
      AUTH_APP_ID_WEB: process.env.AUTH_APP_ID_WEB,
      AUTH_APP_ID_NATIVE: process.env.AUTH_APP_ID_NATIVE,
      KANJI_BASE_URL: process.env.KANJI_BASE_URL ?? 'http://localhost:5000',
    },
  },
};
