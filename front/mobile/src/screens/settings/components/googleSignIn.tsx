import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TouchableOpacity, View as RNView } from 'react-native';
import { Config } from 'react-native-config';
import { Assets, Icon, Text } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { recoverAccount, selectUserState } from '../../../store/slices/user';
import { useGoogleSignInStyles } from '../hooks/useGoogleSignInStyles';

export default function GoogleSignInButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToaster();
  const userState = useSelector(selectUserState);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const styles = useGoogleSignInStyles();

  useEffect(() => {
    GoogleSignin.configure({ webClientId: Config.GOOGLE_CLIENT_ID });
  }, []);

  const handlePress = useCallback(async () => {
    setIsSigningIn(true);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        setIsSigningIn(false);
        return;
      }

      const action = await dispatch(recoverAccount({ userId: userState.userId, idToken: response.data.idToken }));

      if (recoverAccount.fulfilled.match(action)) {
        toast?.show({
          message: t(action.payload.migrated ? 'settings.googleSignIn.recovered' : 'settings.googleSignIn.linked'),
          type: 'success',
        });
      } else {
        toast?.show({ message: t('settings.googleSignIn.error'), type: 'failure' });
      }
    } catch {
      toast?.show({ message: t('settings.googleSignIn.error'), type: 'failure' });
    } finally {
      setIsSigningIn(false);
    }
  }, [dispatch, userState.userId, toast, t]);

  if (userState.providerId) {
    return (
      <RNView style={styles.linkedRow}>
        <Icon source={Assets.icons.google} size={20} />
        <Text text80M $textDefault numberOfLines={1}>
          {t('settings.googleSignIn.linkedAs', { email: userState.email })}
        </Text>
      </RNView>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isSigningIn}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={t('settings.googleSignIn.button')}>
      {isSigningIn ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Icon source={Assets.icons.google} size={28} tintColor="#fff" />
      )}
      <Text text80M white>
        {t('settings.googleSignIn.button')}
      </Text>
    </TouchableOpacity>
  );
}
