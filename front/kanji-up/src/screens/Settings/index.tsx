import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {SafeAreaView, ScrollView, Text} from 'react-native';
import {Appbar, Button, IconButton, ProgressBar, TextInput} from 'react-native-paper';

import styles from './style';
import {RootState} from '../../store';
import colors from '../../constants/colors';
import Slider from '../../components/Slider';
import {SettingsProps} from '../../types/screens';
import {error} from '../../store/slices';
import {readFile} from '../../service/file';
import CustomDialog from '../../components/CustomDialog';
import useHandlers from './useHandlers';

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
  const [dialogMessages, setDialogMessages] = React.useState({ title: '', description: '' });
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);

  const isButtonDisabled = React.useMemo(() => {
    const isNameEmpty = values.username === '';
    const isUnchanged = Object.keys(savedSettings).every((key) => (values as any)[key] === (savedSettings as any)[key]);

    return isNameEmpty || isUnchanged;
  }, [values, savedSettings, firstTime]);

  const { handleBack, handleSave, handleUpdate } = useHandlers({ values, navigation, isButtonDisabled, setDialog, setDialogMessages, setIsDownloading, setProgress });

  const progressComponent = React.useMemo(() => (
    <ProgressBar progress={progress} />
  ), [progress]);

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
      <Button mode="outlined" style={styles.button} onPress={handleUpdate}>Check updates</Button>
    </ScrollView>
    <Button mode="contained" disabled={isButtonDisabled} style={styles.button} onPress={handleSave}>Save</Button>
    <CustomDialog
      visible={dialog}
      message={dialogMessages}
      component={isDownloading && progressComponent}
      onDismiss={() => setDialog(false)}
      onSave={() => { handleSave(); navigation.navigate('Home'); }}
      onCancel={() => { setDialog(false); navigation.navigate('Home'); } }
      actions={!isDownloading ? [true, true] : undefined}
    />
  </SafeAreaView>;
};
