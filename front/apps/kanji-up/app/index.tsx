import { useCallback, useEffect } from 'react';
import { Image, Platform, SafeAreaView, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth, useKanjiAppAuth } from 'kanji-app-auth';
import config from 'kanji-app-core';

import styles from '../styles/global';
import { useGlobalSearchParams } from 'expo-router';

const authUrl = `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/auth/login?app_id=`;
const appId = Platform.select({
  web: process.env.EXPO_PUBLIC_AUTH_APP_ID_WEB,
  native: process.env.EXPO_PUBLIC_AUTH_APP_ID_NATIVE,
});
const endpointUrls = {
  kanji: process.env.EXPO_PUBLIC_KANJI_BASE_URL,
  recognition: process.env.EXPO_PUBLIC_RECOGNITION_BASE_URL,
};

export default function Page() {
  const AuthContext = useAuth();
  const { access_token } = useGlobalSearchParams();
  const { token, login } = useKanjiAppAuth();

  const signIn = useCallback(
    (accessToken: string) => {
      if (AuthContext) {
        AuthContext.signIn(accessToken);

        config.init(endpointUrls, accessToken);
      }
    },
    [AuthContext]
  );

  console.warn(access_token);

  const handleAuth = useCallback(async () => {
    const accessToken = await login(authUrl + appId);
    console.warn(accessToken);
    signIn(accessToken);
  }, []);

  useEffect(() => {
    if (token) {
      signIn(token);
    }
  }, [token]);

  return (
    <SafeAreaView style={[styles.main, { justifyContent: 'center', alignItems: 'center' }]}>
      <Image source={require('../assets/images/adaptive-icon.png')} style={{ width: 200, height: 200 }} />
      <Text style={[styles.title, { marginTop: 0 }]}>Welcome on KanjiUp application</Text>
      <Button icon="account" onPress={handleAuth} mode="contained" style={{ borderRadius: 25, width: '70%' }}>
        Sign in
      </Button>
    </SafeAreaView>
  );
}
