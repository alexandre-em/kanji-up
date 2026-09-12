import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getUniqueId } from 'react-native-device-info';
import { Badge, Colors } from 'react-native-ui-lib';
import Button from 'react-native-ui-lib/button';
import View from 'react-native-ui-lib/view';
import { useSelector } from 'react-redux';

import { screenNames } from '../../constants/screens';
import { ONBOARDING_FINISHED_KEY } from '../../constants/storage';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useIsOffline } from '../../providers/network';
import { useToaster } from '../../providers/toaster';
import { fileServiceInstance } from '../../services/file';
import { createUser, getUser, selectCreateStatus, selectGetUserStatus, selectUserName } from '../../store/slices/user';
import Step1 from './components/step1';
import Step2 from './components/step2';
import Step3 from './components/step3';
import Step4 from './components/step4';

export type StepProps = {
  step: number;
};

export default function Onboarding() {
  const toast = useToaster();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isOffline = useIsOffline();
  const userName = useSelector(selectUserName);
  const userState = useAppSelector((state) => state.user);
  const getUserStatus = useSelector(selectGetUserStatus);
  const createUserStatus = useSelector(selectCreateStatus);
  const navigation = useNavigation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    getUniqueId().then((deviceId) => {
      dispatch(getUser({ macAddress: deviceId }));
    });
  }, [dispatch]);

  useEffect(() => {
    if (getUserStatus === 'succeeded' && userState.macAddress) {
      fileServiceInstance.write(ONBOARDING_FINISHED_KEY, userState);
      navigation.navigate(screenNames.HOME);
    }
  }, [getUserStatus, userState, navigation]);

  const handleNext = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (isSubmitted && userName.length > 0 && (createUserStatus === 'idle' || createUserStatus === 'failed')) {
      getUniqueId().then((deviceId) => {
        dispatch(createUser({ name: userName, macAddress: deviceId, trainingConsent: userState.trainingConsent }));
      });
    }
  }, [dispatch, userName, isSubmitted, createUserStatus, userState.trainingConsent]);

  useEffect(() => {
    if (createUserStatus === 'succeeded') {
      fileServiceInstance.write(ONBOARDING_FINISHED_KEY, true).then(() => {
        navigation.navigate('Home');
        toast?.show({ message: t('onboarding.toast.success'), type: 'success' });
      });
    } else if (createUserStatus === 'failed') {
      toast?.show({ message: t('onboarding.toast.error'), type: 'failure' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createUserStatus]);

  const handleSubmit = useCallback(async () => {
    if (userName.length > 0) setIsSubmitted(true);
  }, [userName]);

  return (
    <View height="100%" paddingH-20>
      <Step1 step={step} />
      <Step2 step={step} />
      <Step3 step={step} />
      <Step4 step={step} />
      <Button
        label={step === 3 ? t('onboarding.submit.button') + ' 🚀' : t('onboarding.next.button')}
        outline={step !== 3}
        onPress={step === 3 ? handleSubmit : handleNext}
        disabled={
          (step === 2 && userName.trim().length === 0) ||
          (step === 3 && ((userName.length === 0 && createUserStatus === 'pending') || isOffline))
        }
      />
      {step === 3 && isOffline && (
        <Badge
          label={t('offline.badge')}
          size={20}
          backgroundColor={Colors.$backgroundNeutralMedium}
          labelStyle={{ color: Colors.$textNeutral }}
          style={{ alignSelf: 'center', marginTop: 12 }}
        />
      )}
    </View>
  );
}
