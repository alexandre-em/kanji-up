import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Dialog, FAB, List, Paragraph, Portal, ProgressBar, Searchbar, Surface } from 'react-native-paper';
import StepIndicator from 'react-native-step-indicator';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './style';
import { menu, list, labels, stepperStyles } from './const';
import { asyncstorageKeys, colors, snackbarColors } from '../../constants';
import { HomeProps } from '../../types/screens';
import GradientCard from '../../components/GradientCard';
import { RootState } from '../../store';
import { Certification, Trip, Reminders } from '../../svg';
import { readFile, writeFile } from '../../service/file';
import { settings, user, error } from '../../store/slices';
import useAuth from '../../hooks/useAuth';
// import useModelDownload from './hooks/useModelDownload';

export default function Home({ navigation, route }: HomeProps) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const userState = useSelector((state: RootState) => state.user);
  const settingsState = useSelector((state: RootState) => state.settings);
  const [open, setOpen] = useState({ open: false });
  const { isConnected, setIsConnected, handleAuth } = useAuth();
  // const { downloadProgress, handleDismissDownload } = useModelDownload();

  const randomKanji = useMemo(() => {
    if (kanjiState.selectedKanji && Object.keys(kanjiState.selectedKanji).length > 0) {
      const kanjiKeys: Array<string> = Object.keys(kanjiState.selectedKanji);
      const random: number = Math.floor(Math.random() * kanjiKeys.length);
      const choosenKanji: Partial<KanjiType> = kanjiState.selectedKanji[kanjiKeys[random]];

      const icon = (props: any) => {
        if (choosenKanji.kanji?.character) {
          if (Platform.OS === 'web') {
            return <Image {...props} style={{ width: 32, height: 32 }} source={{ uri: `https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}` }} />;
          }
          return <SvgUri width={32} height={32} uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}`} />;
        }
        return null;
      };

      return (
        <List.Item
          title={choosenKanji.kanji?.meaning}
          description="See details"
          left={icon}
          onPress={() => navigation.navigate('KanjiDetail', { id: choosenKanji.kanji_id as string })}
          style={{ marginHorizontal: 20 }}
        />
      );
    }
    return null;
  }, [kanjiState]);

  const step = useMemo(() => {
    const { dailyScore } = userState;
    if (dailyScore < parseInt(labels[0], 10)) {
      return 0;
    }
    if (dailyScore < parseInt(labels[1], 10)) {
      return 1;
    }
    if (dailyScore < parseInt(labels[2], 10)) {
      return 2;
    }
    return 0;
  }, [userState]);

  const renderItem = ({ item }: any) => (
    <GradientCard onPress={() => navigation.navigate(item.screen, item.screenOptions)} image={item.image} title={item.title} subtitle={item.subtitle} buttonTitle={item.buttonTitle} />
  );

  const stepperIllustration = useMemo(() => {
    if (step === 0) {
      return <Trip width={220} height={180} />;
    }
    if (step === 1) {
      return <Reminders width={220} height={180} />;
    }
    if (step === 2) {
      return <Certification width={220} height={180} />;
    }

    return null;
  }, [step]);

  const stepperMessage = useMemo(() => {
    if (step === 0) {
      return "Let's begin !";
    }
    if (step === 1) {
      return 'Almost there !';
    }
    if (step === 2) {
      return 'Good job !';
    }

    return '';
  }, [step]);

  // const dialog = useMemo(
  //   () => (
  //     <Portal>
  //       <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={downloadProgress.showDialog} onDismiss={handleDismissDownload}>
  //         <Dialog.Title>Initializing the application</Dialog.Title>
  //         <Dialog.Content>
  //           <Paragraph>{downloadProgress.message}</Paragraph>
  //           <ProgressBar progress={downloadProgress.progress} />
  //         </Dialog.Content>
  //       </Dialog>
  //     </Portal>
  //   ),
  //   [downloadProgress]
  // );

  const refreshUserInfo = React.useCallback(() => {
    if (userState) {
      const newContent = { ...userState.scores };
      const date = new Date();
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      newContent[key] = userState.dailyScore;
      writeFile('userInfo', JSON.stringify(newContent))
        .then(() => dispatch(error.actions.update({ message: 'User info Saved', color: snackbarColors.info })))
        .catch((err) => dispatch(error.actions.update({ message: `Error + ${err.message}` })));
    }
  }, [userState]);

  useEffect(() => {
    if (route.params && (route.params as any).access_token) {
      const accessToken = (route.params as any).access_token;

      AsyncStorage.setItem(asyncstorageKeys.ACCESS_TOKEN, accessToken);
      dispatch(settings.actions.update({ accessToken }));
      setIsConnected(true);
    }
  }, [route.params]);

  if (isConnected === false) {
    return (
      <SafeAreaView style={[styles.main, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image source={require('../../../assets/adaptive-icon.png')} style={{ width: 200, height: 200 }} />
        <Text style={[styles.title, { marginTop: 0 }]}>Welcome on KanjiUp application</Text>
        <Button icon="account" onPress={handleAuth} mode="contained" style={{ borderRadius: 25, width: '70%' }}>
          Sign in
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.header}>
        <Button mode="contained" style={{ borderRadius: 25 }}>
          {userState.totalScore}
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('Settings', { firstTime: false })}>
          <Avatar.Text size={40} label={settingsState.username.charAt(0) || '-'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 0.9 }} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={{ marginLeft: 20, fontSize: 18, color: colors.text }}>Hello,</Text>
          <Text style={[styles.title, { marginTop: 0 }]}>{settingsState.username}さん</Text>
        </View>
        <View style={styles.search}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ width: '90%', borderRadius: 25 }}
            inputStyle={{ color: colors.text, fontSize: 15 }}
            onSubmitEditing={() => navigation.navigate('Search', { search: searchQuery })}
          />
        </View>

        <View style={styles.stepper}>
          <Text style={styles.title}>Today&apos;s objectives</Text>
          <StepIndicator stepCount={3} customStyles={stepperStyles} currentPosition={step} labels={labels} />
        </View>

        <Surface style={styles.surface}>
          <View style={{ marginHorizontal: 20 }}>{stepperIllustration}</View>
          <View style={{ margin: 10 }}>
            <Text style={{ color: colors.secondary, fontSize: 30, fontWeight: '800', marginHorizontal: 20 }}>{stepperMessage}</Text>
            <Text style={[styles.title, { fontSize: 22, marginTop: 0 }]}>{userState.dailyScore} pts</Text>
            <Button icon="reload" onPress={refreshUserInfo} mode="contained" style={{ borderRadius: 25 }}>
              Synchronize
            </Button>
          </View>
        </Surface>

        <Text style={styles.title}>Random</Text>
        {randomKanji}

        <Text style={styles.title}>Quick start</Text>
        <FlatList
          horizontal
          style={{ marginHorizontal: 20, marginBottom: 20 }}
          data={list}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={225}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>

      <FAB.Group
        visible
        open={open.open}
        icon={open.open ? 'close' : 'menu'}
        color="white"
        fabStyle={{ backgroundColor: colors.secondary }}
        actions={menu.map((m) => ({ ...m, onPress: () => navigation.navigate(m.screen as any, m.navOpt) }))}
        onStateChange={setOpen}
      />
      {/* dialog */}
    </SafeAreaView>
  );
}
