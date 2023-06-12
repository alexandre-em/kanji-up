import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import jwtDecode from 'jwt-decode';

import { asyncstorageKeys } from '../constants';
import { settings } from '../store/slices';

WebBrowser.maybeCompleteAuthSession();

export default function useAuth() {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const handleAuth = useCallback(async () => {
    const appId = Platform.select({
      web: '535d3fc2-75f6-4468-9765-639dc3a66931',
      native: '0333f691-dbc0-4030-98fe-31cee20b7613',
    });

    // Developpement environment
    // const appId = Platform.select({
    //   web: '2a2541f9-b476-4853-9625-34918c625ddb',
    //   native: '9e2791ee-3420-4f8b-8f2a-32d3e06878c6',
    // });

    const authUrl = `https://kanjiup-auth.alexandre-em.fr/auth/login?app_id=${appId}`;

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
  };
}
