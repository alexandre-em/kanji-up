import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

import { asyncstorageKeys } from '../../constants';
import { writeFile } from '../../service/file';
import { settings } from '../../store/slices';
import usePrediction from '../../hooks/usePrediction';
import useAuth from '../../hooks/useAuth';

interface HandlersProps {
  values: SettingValuesType;
  navigation: any;
  isButtonDisabled: boolean;
  setDialog: Function;
  setDialogMessages: Function;
  setIsDownloading: Function;
  setProgress: Function;
}

WebBrowser.maybeCompleteAuthSession();

export default function useHandlers({ values, navigation, isButtonDisabled, setDialog, setDialogMessages, setIsDownloading, setProgress }: HandlersProps) {
  const dispatch = useDispatch();
  const model = usePrediction();
  const { handleDisconnect } = useAuth();

  const handleSave = useCallback(async () => {
    await AsyncStorage.setItem(asyncstorageKeys.FIRST_TIME, 'false');
    const json = JSON.stringify(values);
    await writeFile('userSettings', json);
    dispatch(settings.actions.update(values));
    setDialog(false);

    navigation.navigate('Home');
  }, [values]);

  const handleBack = useCallback(() => {
    if (isButtonDisabled) {
      navigation.navigate('Home');
    } else {
      setDialog(true);
      setDialogMessages({ title: 'Before quitting', description: 'Do you want to save your selection ?' });
    }
  }, [isButtonDisabled]);

  const handleUpdate = useCallback(async () => {
    setDialogMessages({ title: 'Checking versions', description: 'Downloading a new version of the models' });
    setDialog(true);
    setIsDownloading(true);
    const onDownloadProgress = (progressEvent: any) => {
      const percentCompleted = progressEvent.loaded / progressEvent.total;
      setProgress(percentCompleted);
    };

    await model.downloadThenSave(
      Platform.OS === 'web'
        ? onDownloadProgress
        : (progress: number) => {
            setProgress(progress);
          }
    );
    setIsDownloading(false);
    setDialog(false);
  }, []);

  const handleSignout = useCallback(async () => {
    const authUrl = `https://kanjiup-auth.alexandre-em.fr/auth/logout`;
    await WebBrowser.openAuthSessionAsync(authUrl);
    handleDisconnect();
    navigation.replace('Home', null, null, Math.random.toString());
  }, []);

  return { handleSave, handleBack, handleUpdate, handleSignout };
}
