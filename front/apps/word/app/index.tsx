import { useCallback, useEffect } from 'react';
import { Image, SafeAreaView, Text } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useAuth, useKanjiAppAuth } from 'kanji-app-auth';
import config from 'kanji-app-core';

import { appId, authUrl, endpointUrls } from '../constants';
import styles from '../constants/style';

export default function Page() {
  const AuthContext = useAuth();
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

  const handleAuth = useCallback(async () => {
    AuthContext?.setLoading(true);
    login(authUrl + appId)
      .then((accessToken) => {
        signIn(accessToken);
      })
      .finally(() => {
        AuthContext?.setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (token) {
      signIn(token);
      AuthContext?.setLoading(false);
    }
  }, [token]);

  if (AuthContext?.loading) {
    return (
      <SafeAreaView style={[styles.main, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.main, { justifyContent: 'center', alignItems: 'center' }]}>
      <Image source={require('../assets/images/adaptive-icon.png')} style={{ width: 200, height: 200 }} />
      <Text style={[styles.title, { marginTop: 0 }]}>Welcome on KanjiUp Word application</Text>
      <Button icon="account" onPress={handleAuth} mode="contained" style={{ borderRadius: 25, width: '70%' }}>
        Sign in
      </Button>
    </SafeAreaView>
  );
}
