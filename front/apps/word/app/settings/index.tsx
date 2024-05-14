import { router } from 'expo-router';
import React from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { Avatar, Button, Switch } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { Slider } from 'kanji-app-svg-ui';
import { Content, CustomDialog, globalStyle } from 'kanji-app-ui';

import useSettingsHook from './hook';
import styles from './style';
import { colors } from '../../constants/Colors';
import { UserAppRedirection } from '../../services/redirections';
import { RootState } from '../../store';

const globalStyles = globalStyle(colors);

export default function Settings() {
  const userState = useSelector((root: RootState) => root.user);
  const {
    values,
    dialog,
    dialogMessages,
    isButtonDisabled,
    AuthContext,
    handleBack,
    handleSignout,
    handleSave,
    setDialog,
    setValues,
  } = useSettingsHook();

  return (
    <>
      <Content header={{ title: `Application's settings`, onBack: handleBack }}>
        <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <Text style={globalStyles.title}>User&apos;s settings</Text>
          <Pressable
            style={{ alignSelf: 'center' }}
            onPress={() => UserAppRedirection(userState.userId, AuthContext?.accessToken || '')}>
            {userState.userId ? (
              <Avatar.Image
                size={100}
                source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${userState.userId}` }}
              />
            ) : (
              <Avatar.Text size={40} label={userState.username.charAt(0) || '-'} />
            )}
          </Pressable>
          <Button style={styles.button} onPress={() => UserAppRedirection(userState.userId, AuthContext?.accessToken || '')}>
            Edit profile
          </Button>
          <Text style={globalStyles.title}>Application&apos;s settings</Text>
          <View style={styles.switchGroup}>
            <Text style={globalStyles.subtitle}>Use offline recognition model</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View>
          <Text style={globalStyles.subtitle}>Evaluation card number</Text>
          <Slider
            value={values.evaluationCardNumber!}
            onValueChange={(newValue: number) => setValues((prev) => ({ ...prev, evaluationCardNumber: newValue }))}
            min={50}
            max={60}
            color={colors.primary}
          />
          <Text style={globalStyles.subtitle}>Evaluation time (s)</Text>
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
      </Content>
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
    </>
  );
}
