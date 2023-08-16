import { useCallback, useEffect } from 'react';
import { Image, SafeAreaView, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth, useKanjiAppAuth } from 'kanji-app-auth';
import config from 'kanji-app-core';

import styles from '../styles/global';
import { router } from 'expo-router';

const authUrl = `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/auth/login?app_id=`;
const appId = process.env.EXPO_PUBLIC_AUTH_APP_ID_WEB;
const endpointUrls = {
  kanji: process.env.KANJI_BASE_URL,
  recognition: process.env.RECOGNITION_BASE_URL,
};

export default function Page() {
  const AuthContext = useAuth();
  const { token, login } = useKanjiAppAuth({ authUrl: authUrl + appId });

  const handleAuth = useCallback(async () => {
    if (AuthContext) {
      const accessToken = await login();
      AuthContext.signIn(accessToken);
      config.init(endpointUrls, accessToken);

      router.replace('/home');
    }
  }, [AuthContext]);

  useEffect(() => {
    if (AuthContext && token) {
      AuthContext.signIn(token);

      config.init(endpointUrls, token);

      router.replace('/home');
    }
  }, [AuthContext, token]);

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
