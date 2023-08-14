import { useCallback, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const asyncstorageKeys = {
  FIRST_TIME: '@isFirstTime',
  ACCESS_TOKEN: 'accessToken',
};

WebBrowser.maybeCompleteAuthSession();

export default function useKanjiAppAuth({ authUrl }: { authUrl: string }) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleAuth = useCallback(async () => {
    const results = await WebBrowser.openAuthSessionAsync(authUrl);

    if (results && results.type === 'success') {
      const parseParam = results.url.split('?access_token=');
      const newToken = parseParam[1];

      if (newToken !== null || newToken !== undefined) {
        AsyncStorage.setItem(asyncstorageKeys.ACCESS_TOKEN, newToken);
        // dispatch(settings.actions.update({ accessToken: newToken }));
        setIsConnected(true);
        setToken(newToken);
      }
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    AsyncStorage.removeItem(asyncstorageKeys.ACCESS_TOKEN);
    await WebBrowser.openAuthSessionAsync(authUrl);
    handleDisconnect();
    // dispatch(settings.actions.logout());
    setIsConnected(false);
    setToken(null);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(asyncstorageKeys.ACCESS_TOKEN).then((res: string | null) => {
      if (res === null || res === undefined) {
        setIsConnected(false);
        setToken(null);
      } else {
        const decodedToken: DecodedToken = jwtDecode(res);
        const isTokenValid = new Date() < new Date(decodedToken.exp * 1000);

        if (isTokenValid) {
          // dispatch(settings.actions.update({ accessToken: res }));
          setToken(res);
        } else {
          AsyncStorage.removeItem(asyncstorageKeys.ACCESS_TOKEN);
        }

        setIsConnected(isTokenValid);
      }
    });
  }, []);

  return {
    isConnected,
    token,
    handleAuth,
    handleDisconnect,
  };
}
