import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecodedToken } from 'kanji-app-types';

import { asyncstorageKeys } from './constants';

WebBrowser.maybeCompleteAuthSession();

export default function useKanjiAppAuth() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (authUrl: string | undefined) => {
    if (!authUrl) {
      throw new Error('Need an url to redirect');
    }
    const results = await WebBrowser.openAuthSessionAsync(authUrl);

    console.warn(results);

    if ((results && results.type === 'success') || results.type === 'opened') {
      const parseParam = results.url.split('?access_token=');
      const newToken = parseParam[1];

      if (newToken !== null || newToken !== undefined) {
        AsyncStorage.setItem(asyncstorageKeys.ACCESS_TOKEN, newToken);
        // dispatch(settings.actions.update({ accessToken: newToken }));
        setIsConnected(true);
        setToken(newToken);

        return newToken;
      }
    }

    if (results.type !== 'dismiss' && Platform.OS !== 'android') throw new Error('No token given. Aborting. Please try again.');
    else return null;
  }, []);

  const logout = useCallback(async (authUrl: string | undefined) => {
    if (!authUrl) {
      throw new Error('Need an url to redirect');
    }

    AsyncStorage.removeItem(asyncstorageKeys.ACCESS_TOKEN);
    await WebBrowser.openAuthSessionAsync(authUrl);
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
  }, [token]);

  return {
    isConnected,
    token,
    login,
    logout,
  };
}
