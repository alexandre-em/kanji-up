import React, {useCallback, useMemo} from 'react';
import {SafeAreaView, ScrollView, Text} from 'react-native';
import {Appbar, Button, IconButton, TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';

import AsyncStorageKeys from '../../constants/asyncstorageKeys';
import Slider from '../../components/Slider';
import {SettingsProps} from '../../types/screens';
import styles from './style';
import colors from '../../constants/colors';
import CustomDialog from '../../components/CustomDialog';
import {readFile, writeFile} from '../../service/file';
import {error, settings} from '../../store/slices';
import {RootState} from '../../store';

const defaultValues = {
  username: '',
  flashcardNumber: 30,
  evaluationCardNumber: 70,
  evaluationTime: 60,
};

export default function Settings({ navigation, route }: SettingsProps) {
  const { firstTime } = route.params;
  const dispatch = useDispatch();
  const savedSettings = useSelector((state: RootState) => state.settings);
  const [values, setValues] = React.useState<SettingValuesType>(defaultValues);
  const [dialog, setDialog] = React.useState<boolean>(false);

  const handleSave = useCallback(async () => {
    await AsyncStorage.setItem(AsyncStorageKeys.FIRST_TIME, 'false');
    const json = JSON.stringify(values);
    await writeFile('userSettings', json);
    dispatch(settings.actions.update(values));
    setDialog(false);
    
    navigation.navigate('Home');
  }, [values]);

  const isButtonDisabled = React.useMemo(() => {
    const isNameEmpty = values.username === '';
    const isUnchanged = Object.keys(savedSettings).every((key) => (values as any)[key] === (savedSettings as any)[key]);

    return isNameEmpty || isUnchanged;
  }, [values, savedSettings, firstTime]);

  const handleBack = useCallback(() => {
    if (isButtonDisabled) { navigation.navigate('Home'); }
    else { setDialog(true); }
  }, [isButtonDisabled]);

  React.useEffect(() => {
    if (!firstTime) {
      readFile('userSettings')
        .then((content) => setValues(JSON.parse(content)))
        .catch(() => dispatch(error.actions.update("Could not load user data")))
    }
  }, [firstTime]);

  return <SafeAreaView style={styles.main}>
    {!firstTime && <Appbar.Header>
      <Appbar.BackAction onPress={handleBack}/>
      <Appbar.Content title="Application's settings" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      <IconButton icon="content-save" color="#fff" />
  </Appbar.Header>}
    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>User's settings</Text>
      <TextInput label="Insert an username" style={{ backgroundColor: '#fff' }} mode="outlined" value={values?.username} onChangeText={(t) => setValues((prev) => ({ ...prev, username: t }))} />
      <Text style={styles.subtitle}>Practice flashcard number</Text>
      <Slider value={values.flashcardNumber} onValueChange={(newValue:number) => setValues((prev) => ({ ...prev, flashcardNumber: newValue }))} min={20} max={30} />
      <Text style={styles.subtitle}>Evaluation card number</Text>
      <Slider value={values.evaluationCardNumber} onValueChange={(newValue:number) => setValues((prev) => ({ ...prev, evaluationCardNumber: newValue }))} min={50} max={60} />
      <Text style={styles.subtitle}>Evaluation time (s)</Text>
      <Slider value={values.evaluationTime} onValueChange={(newValue:number) => setValues((prev) => ({ ...prev, evaluationTime: newValue }))} min={20} max={120} />
      <Text style={styles.subtitle}>Already have an account ?</Text>
      <Text style={{ color: colors.text, alignSelf: 'center' }}>Current user id: xxxx-xxx-xxxx</Text>
      <Button mode="outlined" style={styles.button}>Previous data</Button>
      <Text style={[styles.title, { marginVertical: 15 }]}>Application's settings</Text>
      <Text style={{ color: colors.text, alignSelf: 'center' }}>Last update: 20/09/2022</Text>
      <Button mode="outlined" style={styles.button}>Check updates</Button>
    </ScrollView>
    <Button mode="contained" disabled={isButtonDisabled} style={styles.button} onPress={handleSave}>Save</Button>
    <CustomDialog
      visible={dialog}
      message={{ title: 'Before quitting', description: 'Do you want to save your selection ?' }}
      onDismiss={() => setDialog(false)}
      onSave={() => { handleSave(); navigation.navigate('Home'); }}
      onCancel={() => { setDialog(false); navigation.navigate('Home'); } }
    />
  </SafeAreaView>;
};

