import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, ScrollView, Text } from 'react-native';
import { Appbar, Button, IconButton, Switch } from 'react-native-paper';
import { Slider } from 'kanji-app-svg-ui';

import styles from './style';
import { RootState } from 'store';
import { colors } from 'constants/Colors';
import { error } from 'store/slices';
import { readFile } from 'services/file';
import CustomDialog from 'components/CustomDialog';
import useHandlers from './useHandler';
import { router } from 'expo-router';
import global from 'styles/global';

const defaultValues: Partial<SettingValuesType> = {
  flashcardNumber: 30,
  evaluationCardNumber: 70,
  evaluationTime: 60,
  useLocalModel: true,
};

export default function Settings() {
  const dispatch = useDispatch();
  const savedSettings = useSelector((state: RootState) => state.settings);
  const [values, setValues] = useState<Partial<SettingValuesType>>(defaultValues);
  const [dialog, setDialog] = useState<boolean>(false);
  const [dialogMessages, setDialogMessages] = useState({
    title: '',
    description: '',
  });

  const isButtonDisabled = React.useMemo(() => {
    const comparedValues = Object.keys(values).map((key) => (values as any)[key] === (savedSettings as any)[key]);
    const isUnchanged = comparedValues.reduce((prev, curr) => prev && curr, true);

    return isUnchanged;
  }, [values, savedSettings]);

  const { handleBack, handleSave, handleSignout } = useHandlers({
    values,
    isButtonDisabled,
    setDialog,
    setDialogMessages,
  });

  React.useEffect(() => {
    readFile('userSettings')
      .then((content) => setValues(JSON.parse(content)))
      .catch(() => dispatch(error.actions.update({ message: 'Could not load user data' })));
  }, []);

  return (
    <View style={global.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Application's settings" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
        <IconButton icon="content-save" />
      </Appbar.Header>
      <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={global.title}>Application&apos;s settings</Text>
        <View style={styles.switchGroup}>
          <Text style={global.subtitle}>Use offline recognition model</Text>
          <Switch
            value={values.useLocalModel}
            onValueChange={() => setValues((prevState) => ({ ...prevState, useLocalModel: !prevState.useLocalModel }))}
          />
        </View>
        <Text style={global.subtitle}>Practice flashcard number</Text>
        <Slider
          value={values.flashcardNumber!}
          onValueChange={(newValue: number) => setValues((prev) => ({ ...prev, flashcardNumber: newValue }))}
          min={20}
          max={30}
          color={colors.primary}
        />
        <Text style={global.subtitle}>Evaluation card number</Text>
        <Slider
          value={values.evaluationCardNumber!}
          onValueChange={(newValue: number) => setValues((prev) => ({ ...prev, evaluationCardNumber: newValue }))}
          min={50}
          max={60}
          color={colors.primary}
        />
        <Text style={global.subtitle}>Evaluation time (s)</Text>
        <Slider
          value={values.evaluationTime!}
          onValueChange={(newValue: number) => setValues((prev) => ({ ...prev, evaluationTime: newValue }))}
          min={20}
          max={120}
          color={colors.primary}
        />
      </ScrollView>
      <Button mode="contained" disabled={isButtonDisabled} style={styles.button} onPress={handleSave}>
        Save
      </Button>
      <Button mode="outlined" style={styles.button} onPress={handleSignout}>
        Sign out
      </Button>
      <CustomDialog
        visible={dialog}
        message={dialogMessages}
        onDismiss={() => setDialog(false)}
        onSave={() => {
          handleSave();
          router.replace('/home');
        }}
        onCancel={() => {
          setDialog(false);
          router.replace('/home');
        }}
        actions={[true, true]}
      />
    </View>
  );
}
