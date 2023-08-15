import { useCallback } from 'react';
import { Image, SafeAreaView, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth, useKanjiAppAuth } from 'kanji-app-auth';

import styles from '../styles/global';

export default function Page() {
  const url = 'https://kanjiup-auth.cyclic.app/auth/login?app_id=';
  const appId = '2a2541f9-b476-4853-9625-34918c625ddb';
  const AuthContext = useAuth();
  const { login } = useKanjiAppAuth({ authUrl: url + appId });

  const handleAuth = useCallback(async () => {
    if (AuthContext) {
      const accessToken = await login();
      AuthContext.signIn(accessToken);
    }
  }, [AuthContext]);

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
