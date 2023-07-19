import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import jwtDecode from 'jwt-decode';
import Constants from 'expo-constants';

import { asyncstorageKeys } from '../constants';
import { settings } from '../store/slices';

WebBrowser.maybeCompleteAuthSession();

export default function useAuth() {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const handleAuth = useCallback(async () => {
    const appId = Platform.select({
      web: Constants?.expoConfig?.extra?.AUTH_APP_ID_WEB,
      native: Constants?.expoConfig?.extra?.AUTH_APP_ID_NATIVE,
    });

    const authUrl = `${Constants?.expoConfig?.extra?.AUTH_BASE_URL}/auth/login?app_id=${appId}`;

    const results = await WebBrowser.openAuthSessionAsync(authUrl);

    if (results && results.type === 'success') {
      const parseParam = results.url.split('?access_token=');
      const newToken = parseParam[1];

      if (newToken !== null || newToken !== undefined) {
        AsyncStorage.setItem(asyncstorageKeys.ACCESS_TOKEN, newToken);
        dispatch(settings.actions.update({ accessToken: newToken }));
        setIsConnected(true);
      }
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    AsyncStorage.removeItem(asyncstorageKeys.ACCESS_TOKEN);
    dispatch(settings.actions.logout());
    setIsConnected(false);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(asyncstorageKeys.ACCESS_TOKEN).then((res: string | null) => {
      if (res === null || res === undefined) {
        setIsConnected(false);
      } else {
        const decodedToken: DecodedToken = jwtDecode(res);
        const isTokenValid = new Date() < new Date(decodedToken.exp * 1000);

        if (isTokenValid) {
          dispatch(settings.actions.update({ accessToken: res }));
        } else {
          AsyncStorage.removeItem(asyncstorageKeys.ACCESS_TOKEN);
        }

        setIsConnected(isTokenValid);
      }
    });
  }, []);

  return {
    isConnected,
    setIsConnected,
    handleAuth,
    handleDisconnect,
  };
}
