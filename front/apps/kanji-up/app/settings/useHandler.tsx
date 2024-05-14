import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { asyncstorageKeys, useKanjiAppAuth, useAuth } from 'kanji-app-auth';

import { writeFile } from '../../services/file';
import { settings } from '../../store/slices';
import { router } from 'expo-router';

interface HandlersProps {
  values: Partial<SettingValuesType>;
  isButtonDisabled: boolean;
  setDialog: (v: boolean) => void;
  setDialogMessages: ({ title, description }: { title: string; description: string }) => void;
}

WebBrowser.maybeCompleteAuthSession();

export default function useHandlers({ values, isButtonDisabled, setDialog, setDialogMessages }: HandlersProps) {
  const dispatch = useDispatch();
  const AuthContext = useAuth();
  const { logout } = useKanjiAppAuth();

  const handleSave = useCallback(async () => {
    await AsyncStorage.setItem(asyncstorageKeys.FIRST_TIME, 'false');
    const json = JSON.stringify(values);
    await writeFile('userSettings', json);
    dispatch(settings.actions.update(values));
    setDialog(false);

    router.replace('/home');
  }, [values]);

  const handleBack = useCallback(() => {
    if (isButtonDisabled) {
      router.push('/home');
    } else {
      setDialog(true);
      setDialogMessages({ title: 'Before quitting', description: 'Do you want to save your selection ?' });
    }
  }, [isButtonDisabled]);

  const handleUpdate = useCallback(async () => {
    // setDialogMessages({ title: 'Checking versions', description: 'Downloading a new version of the models' });
    // setDialog(true);
    // setIsDownloading(true);
    // const onDownloadProgress = (progressEvent: any) => {
    //   const percentCompleted = progressEvent.loaded / progressEvent.total;
    //   setProgress(percentCompleted);
    // };
    // await model.downloadThenSave(
    //   Platform.OS === 'web'
    //     ? onDownloadProgress
    //     : (progress: number) => {
    //         setProgress(progress);
    //       }
    // );
    // setIsDownloading(false);
    // setDialog(false);
  }, []);

  const handleSignout = useCallback(async () => {
    await logout(process.env.EXPO_PUBLIC_AUTH_BASE_URL + '/auth/logout');
    AuthContext!.signOut();
  }, []);

  const handleToggleLocalModel = useCallback(() => {}, []);

  return { handleSave, handleBack, handleUpdate, handleSignout, handleToggleLocalModel };
}
