import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {Appbar, IconButton, TextInput} from 'react-native-paper';

import {SettingsProps} from '../../types/screens';
import styles from './style';

type SettingValuesType = {
  username: string,
  flashcardNumber: number,
  evaluationCardNumber: number,
};

const fcnValues = [{ value: '20', label: '20' }, { value: '30', label: '30' }, { value: '40', label: '40' }, { value: '50', label: '50' }];
const ecnValues = [{ value: '50', label: '50' }, { value: '75', label: '75' }, { value: '100', label: '100' }];

const defaultValues = {
  username: '',
  flashcardNumber: fcnValues[0].value,
  evaluationCardNumber: ecnValues[0].value,
};

export default function Settings({ navigation }: SettingsProps) {
  const [values, setValues] = React.useState<SettingValuesType>(defaultValues);

  return <SafeAreaView style={styles.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()}/>
        <Appbar.Content title="Application's settings" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
        <IconButton icon="content-save" color="#fff" />
      </Appbar.Header>
      <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>User's settings</Text>
        <TextInput label="Insert an username" style={{ backgroundColor: '#f5f5f5' }} mode="outlined" value={values?.username} onChangeText={(t) => setValues((prev) => ({ ...prev, username: t }))} />

      </ScrollView>
    </SafeAreaView>;
};

