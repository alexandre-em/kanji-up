import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Avatar, Button, Dialog, FAB, List, Paragraph, Portal, ProgressBar, Searchbar, Surface} from 'react-native-paper';
import StepIndicator from 'react-native-step-indicator';
import {SvgUri} from 'react-native-svg';
import {useDispatch, useSelector} from 'react-redux';

import styles from './style';
import { menu, list, labels, stepperStyles } from './const';
import colors from '../../constants/colors';
import {HomeProps} from '../../types/screens';
import GradientCard from '../../components/GradientCard';
import {RootState} from '../../store';
import Trip from '../../svg/Trip';
import Certification from '../../svg/Certification';
import Reminders from '../../svg/Reminders';
import usePrediction from '../../hooks/usePrediction';
import {readFile, writeFile} from '../../service/file';
import {user} from '../../store/slices';

export default function Home({ navigation }: HomeProps) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const userState = useSelector((state: RootState) => state.user);
  const settingsState = useSelector((state: RootState) => state.settings);
  const [open, setOpen] = useState({ open: false });
  const [downloadProgress, setDownloadProgress] = useState({ progress: 0, showDialog: false });
  const [isDownloading, setIsDownloading] = useState(false);
  const model = usePrediction();

  const randomKanji = useMemo(() => {
    if (kanjiState.selectedKanji && Object.keys(kanjiState.selectedKanji).length > 0) {
      const kanjiKeys: Array<string> = Object.keys(kanjiState.selectedKanji);
      const random: number = Math.floor(Math.random() * kanjiKeys.length);
      const choosenKanji: Partial<KanjiType> = kanjiState.selectedKanji[kanjiKeys[random]];

      const icon = (props: any) => choosenKanji.kanji?.character
      ? (Platform.OS === 'web'
        ? <Image {...props} style={{ width: 32, height: 32 }} source={{ uri: `https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}` }} />
        : <SvgUri width={32} height={32} uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}`} />)
      : null;

      return (
        <List.Item title={choosenKanji.kanji?.meaning} description="See details" left={icon} onPress={() => navigation.navigate('KanjiDetail', { id: choosenKanji.kanji_id as string })} style={{ marginHorizontal: 20 }} />
        );
    }
    return null;
  }, [kanjiState]);

  const step = useMemo(() => {
    const dailyScore = userState.dailyScore;
    if (dailyScore < parseInt(labels[0])) { return 0; }
    if (dailyScore < parseInt(labels[1])) { return 1; }
    if (dailyScore < parseInt(labels[2])) { return 2; }
    return 0;
  }, [userState]);

  const renderItem = ({ item }: any) => {
    return <GradientCard
      onPress={() => navigation.navigate(item.screen, item.screenOptions)}
      image={item.image}
      title={item.title}
      subtitle={item.subtitle}
      buttonTitle={item.buttonTitle}
    />
  }

  const stepperIllustration = useMemo(() => {
    if (step === 0) { return <Trip width={220} height={180} />; }
    if (step === 1) { return <Reminders width={220} height={180} />; }
    if (step === 2) { return <Certification width={220} height={180} />; }
  }, [step]);

  const stepperMessage = useMemo(() => {
    if (step === 0) { return "Let's begin !"; }
    if (step === 1) { return "Almost there !"; }
    if (step === 2) { return "Good job !"; }
  }, [step]);

  const dialog = useMemo(() => (
    <Portal>
      <Dialog style={{ maxWidth: 700, width: '100%', alignSelf: 'center' }} visible={downloadProgress.showDialog} onDismiss={() => setDownloadProgress({ progress: 0, showDialog: false })}>
        <Dialog.Title>Initializing the application</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Downloading models...</Paragraph>
          <ProgressBar progress={downloadProgress.progress} />
        </Dialog.Content>
      </Dialog>
    </Portal>
  ), [downloadProgress]);

  const refreshUserInfo = React.useCallback(() => {
    if (userState) {
      const newContent = { ...userState.scores };
      const date = new Date();
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      newContent[key] = userState.dailyScore;
      writeFile('userInfo', JSON.stringify(newContent))
        .then(() => console.log('User info Saved'))
        .catch((err) => console.error('Error', err));
    }
  }, [userState]);

  useEffect(() => {
    if (userState && userState.dailyScore === 0) {
      (async () => {
        const date = new Date();
        try {
          const content = await readFile('userInfo');
          if (content) {
            const scores = JSON.parse(content);
            const todayScore = scores[`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`];
            const userInfo: UserState = { scores, dailyScore: todayScore || 0, totalScore: Object.values(scores as { [key: string]: number }).reduce((a, b) => a + b, 0) };

            dispatch(user.actions.update(userInfo));
          }

        } catch (err) {
          dispatch(user.actions.reset());
        }
      })()
    }

    return refreshUserInfo;
  }, []);

  useEffect(() => {
    (async () => {
      const isStored = await model.isBufferStored;
      if (model && !(isStored) && !isDownloading) {
        setIsDownloading(true);
        const onDownloadProgress = (progressEvent: any) => {
          const percentCompleted = progressEvent.loaded / progressEvent.total;
          setDownloadProgress({ progress: percentCompleted, showDialog: true });

        };
        await model.downloadThenSave(Platform.OS === 'web' ? onDownloadProgress : (progress: number) => { setDownloadProgress({ progress, showDialog: true }); });
        setDownloadProgress((prev) =>  ({ ...prev, showDialog: false }));
      }
    })();
  }, [model, isDownloading]);

  return (<SafeAreaView style={styles.main}>
    <View style={styles.header}>
      <Button mode="contained" style={{ borderRadius: 25 }}>{userState.totalScore}</Button>
      <TouchableOpacity onPress={() => navigation.navigate('Settings', { firstTime: false })}>
        <Avatar.Text size={40} label={settingsState.username.charAt(0) || '-'} />
      </TouchableOpacity>
    </View>

    <ScrollView style={{ flex: 0.9 }} showsVerticalScrollIndicator={false} >
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
        <Text style={styles.title}>Today's objectives</Text>
        <StepIndicator
          stepCount={3}
          customStyles={stepperStyles}
          currentPosition={step}
          labels={labels}
        />
      </View>

      <Surface style={styles.surface}>
        <View style={{ marginHorizontal: 20 }}>
          {stepperIllustration}
        </View>
        <View style={{ margin: 10 }}>
          <Text style={{ color: colors.secondary, fontSize: 30, fontWeight: '800', marginHorizontal: 20 }}>{stepperMessage}</Text>
          <Text style={[styles.title, { fontSize: 22, marginTop: 0 }]}>{userState.dailyScore} pts</Text>
          <Button icon="reload" onPress={refreshUserInfo} mode="contained" style={{ borderRadius: 25 }}>Synchronize</Button>
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
  {dialog}
</SafeAreaView>);
};
