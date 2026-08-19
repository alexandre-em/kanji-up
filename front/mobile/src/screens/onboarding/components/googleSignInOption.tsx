import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Config } from 'react-native-config';
import { getUniqueId } from 'react-native-device-info';
import { Text } from 'react-native-ui-lib';

import { screenNames } from '../../../constants/screens';
import { ONBOARDING_FINISHED_KEY } from '../../../constants/storage';
import { useAppDispatch } from '../../../hooks/useStore';
import { useToaster } from '../../../providers/toaster';
import { fileServiceInstance } from '../../../services/file';
import { signInWithGoogle } from '../../../store/slices/user';
import { StepProps } from '..';

// Secondary path, deliberately lighter than the name-entry flow above it: a brand-new device has
// nothing to "sign in" to yet, this only matters for someone who already has an account elsewhere
export default function GoogleSignInOption({ step }: StepProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const toast = useToaster();
  const [isSigningIn, setIsSigningIn] = useState(false);

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

      const macAddress = await getUniqueId();
      const action = await dispatch(signInWithGoogle({ idToken: response.data.idToken, macAddress }));

      if (signInWithGoogle.fulfilled.match(action)) {
        await fileServiceInstance.write(ONBOARDING_FINISHED_KEY, true);
        navigation.navigate(screenNames.HOME);
        toast?.show({ message: t('onboarding.toast.success'), type: 'success' });
      } else {
        toast?.show({ message: t('onboarding.googleSignIn.error'), type: 'failure' });
      }
    } catch {
      toast?.show({ message: t('onboarding.googleSignIn.error'), type: 'failure' });
    } finally {
      setIsSigningIn(false);
    }
  }, [dispatch, navigation, toast, t]);

  if (step !== 2) return null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isSigningIn}
      accessibilityRole="button"
      accessibilityLabel={t('onboarding.googleSignIn.button')}>
      {isSigningIn ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text text90M $textNeutral center marginT-16>
          {t('onboarding.googleSignIn.button')}
        </Text>
      )}
    </TouchableOpacity>
  );
}
