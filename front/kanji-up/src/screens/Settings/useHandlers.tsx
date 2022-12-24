import {useCallback} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {asyncstorageKeys} from '../../constants';
import {useDispatch} from "react-redux";

import {writeFile} from '../../service/file';
import {settings} from "../../store/slices";
import {Platform} from "react-native";
import usePrediction from "../../hooks/usePrediction";

interface useHandlersProps {
  values: SettingValuesType;
  navigation: any;
  isButtonDisabled: boolean;
  setDialog: Function;
  setDialogMessages: Function;
  setIsDownloading: Function;
  setProgress: Function;
};

export default function useHandlers({ values, navigation, isButtonDisabled, setDialog, setDialogMessages, setIsDownloading, setProgress }: useHandlersProps) {
  const dispatch = useDispatch();
  const model = usePrediction();

  const handleSave = useCallback(async () => {
    await AsyncStorage.setItem(asyncstorageKeys.FIRST_TIME, 'false');
    const json = JSON.stringify(values);
    await writeFile('userSettings', json);
    dispatch(settings.actions.update(values));
    setDialog(false);
    
    navigation.navigate('Home');
  }, [values]);

  const handleBack = useCallback(() => {
    if (isButtonDisabled) { navigation.navigate('Home'); }
    else {
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

    await model.downloadThenSave(Platform.OS === 'web' ? onDownloadProgress : (progress: number) => { setProgress(progress); });
    setIsDownloading(false);
    setDialog(false);
  }, []);

  return { handleSave, handleBack, handleUpdate }
};
