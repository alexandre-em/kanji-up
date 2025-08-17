import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { getUniqueId } from 'react-native-device-info';
import Button from 'react-native-ui-lib/button';
import View from 'react-native-ui-lib/view';
import { useSelector } from 'react-redux';

import { ONBOARDING_FINISHED_KEY } from '../../constants/storage';
import { useAppDispatch } from '../../hooks/useStore';
import { useToaster } from '../../providers/toaster';
import { fileServiceInstance } from '../../services/file';
import { createUser, selectCreateStatus, selectUserName } from '../../store/slices/user';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';

export type StepProps = {
  step: number;
};

export default function Onboarding() {
  const toast = useToaster();
  const dispatch = useAppDispatch();
  const userName = useSelector(selectUserName);
  const createUserStatus = useSelector(selectCreateStatus);
  const navigation = useNavigation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(0);

  const handleNext = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (isSubmitted && userName.length > 0 && (createUserStatus === 'idle' || createUserStatus === 'failed')) {
      getUniqueId().then((deviceId) => {
        fileServiceInstance.write(ONBOARDING_FINISHED_KEY, true).then(() => {
          dispatch(createUser({ name: userName, macAddress: deviceId }));
        });
      });
    }
  }, [dispatch, userName, isSubmitted, createUserStatus]);

  useEffect(() => {
    if (createUserStatus === 'succeeded') {
      navigation.navigate('Home');
      toast?.show({ message: 'Welcome to KanjiUp !', type: 'success' });
    } else if (createUserStatus === 'failed') {
      toast?.show({ message: 'Something went wrong', type: 'failure' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createUserStatus]);

  const handleSubmit = useCallback(async () => {
    if (userName.length > 0) setIsSubmitted(true);
  }, [userName]);

  return (
    <View height="100%">
      <Step1 step={step} />
      <Step2 step={step} />
      <Step3 step={step} />
      <Button
        label={step === 2 ? "Let's Begin  🚀" : 'Next'}
        outline={step !== 2}
        onPress={step === 2 ? handleSubmit : handleNext}
        disabled={step === 2 && userName.length === 0 && createUserStatus === 'pending'}
      />
    </View>
  );
}
