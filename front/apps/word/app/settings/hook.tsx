import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { asyncstorageKeys, useAuth, useKanjiAppAuth } from 'kanji-app-auth';

import { readFile, fileNames, writeFile } from '../../services/file';
import { RootState } from '../../store';
import { error, settings } from '../../store/slices';

const defaultValues: Partial<SettingValuesType> = {
  flashcardNumber: 30,
  evaluationCardNumber: 70,
  evaluationTime: 60,
  useLocalModel: true,
};

export default function useSettingsHook() {
  const AuthContext = useAuth();
  const dispatch = useDispatch();
  const { logout } = useKanjiAppAuth();
  const [values, setValues] = useState<Partial<SettingValuesType>>(defaultValues);
  const [dialog, setDialog] = useState<boolean>(false);
  const [dialogMessages, setDialogMessages] = useState({
    title: '',
    description: '',
  });
  const savedSettings = useSelector((state: RootState) => state.settings);

  const isButtonDisabled = React.useMemo(() => {
    const comparedValues = Object.keys(values).map((key) => (values as any)[key] === (savedSettings as any)[key]);
    const isUnchanged = comparedValues.reduce((prev, curr) => prev && curr, true);

    return isUnchanged;
  }, [values, savedSettings]);

  const handleSave = useCallback(async () => {
    await AsyncStorage.setItem(asyncstorageKeys.FIRST_TIME, 'false');
    const json = JSON.stringify(values);
    await writeFile(fileNames.USER_SETTINGS, json);
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

  const handleSignout = useCallback(async () => {
    await logout(process.env.EXPO_PUBLIC_AUTH_BASE_URL + '/auth/logout');
    AuthContext!.signOut();
  }, []);

  const handleToggleLocalModel = useCallback(() => {}, []);

  useEffect(() => {
    readFile(fileNames.USER_SETTINGS)
      .then((content) => setValues(JSON.parse(content)))
      .catch(() => dispatch(error.actions.update({ message: 'Could not load user data' })));
  }, []);

  return {
    AuthContext,
    values,
    dialog,
    dialogMessages,
    isButtonDisabled,
    savedSettings,
    handleBack,
    handleSave,
    handleSignout,
    handleToggleLocalModel,
    setValues,
    setDialog,
  };
}
