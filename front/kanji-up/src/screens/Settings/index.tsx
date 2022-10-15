import React, {useCallback} from 'react';
import {SafeAreaView, ScrollView, Text} from 'react-native';
import {Appbar, Button, IconButton, TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AsyncStorageKeys from '../../constants/asyncstorageKeys';
import {SettingsProps} from '../../types/screens';
import styles from './style';

type SettingValuesType = {
  username: string,
  flashcardNumber: string,
  evaluationCardNumber: string,
};

const fcnValues = [{ value: '20', label: '20' }, { value: '30', label: '30' }, { value: '40', label: '40' }, { value: '50', label: '50' }];
const ecnValues = [{ value: '50', label: '50' }, { value: '75', label: '75' }, { value: '100', label: '100' }];

const defaultValues = {
  username: '',
  flashcardNumber: fcnValues[0].value,
  evaluationCardNumber: ecnValues[0].value,
};

export default function Settings({ navigation, route }: SettingsProps) {
  const { firstTime } = route.params;
  const [values, setValues] = React.useState<SettingValuesType>(defaultValues);

  const handlePress = useCallback(async () => {
    await AsyncStorage.setItem(AsyncStorageKeys.FIRST_TIME, 'false');
    navigation.navigate('Home');
  }, []);

  return <SafeAreaView style={styles.main}>
    {!firstTime && <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()}/>
      <Appbar.Content title="Application's settings" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      <IconButton icon="content-save" color="#fff" />
  </Appbar.Header>}
    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>User's settings</Text>
      <TextInput label="Insert an username" style={{ backgroundColor: '#f5f5f5' }} mode="outlined" value={values?.username} onChangeText={(t) => setValues((prev) => ({ ...prev, username: t }))} />

    </ScrollView>
    <Button mode="contained" style={{ width: '80%', alignSelf: 'center', margin: 10, borderRadius: 25 }} onPress={handlePress}>Save</Button>
  </SafeAreaView>;
};

