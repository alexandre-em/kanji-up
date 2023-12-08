import { Platform } from 'react-native';

export const authUrl = `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/auth/login?app_id=`;
export const appId = Platform.select({
  web: process.env.EXPO_PUBLIC_AUTH_APP_ID_WEB,
  native: process.env.EXPO_PUBLIC_AUTH_APP_ID_NATIVE,
});
export const endpointUrls = {
  kanji: process.env.EXPO_PUBLIC_KANJI_BASE_URL,
  recognition: process.env.EXPO_PUBLIC_RECOGNITION_BASE_URL,
  user: process.env.EXPO_PUBLIC_AUTH_BASE_URL,
  word: process.env.EXPO_PUBLIC_WORD_BASE_URL,
};
