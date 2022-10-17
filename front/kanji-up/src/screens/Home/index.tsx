import React, {useMemo, useState} from 'react';
import {FlatList, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Avatar, Button, FAB, List, Searchbar, Surface} from 'react-native-paper';
import StepIndicator from 'react-native-step-indicator';
import {SvgUri} from 'react-native-svg';
import {useSelector} from 'react-redux';

import styles from './style';
import { menu, list, labels } from './const';
import colors from '../../constants/colors';
import {HomeProps} from '../../types/screens';
import GradientCard from '../../components/GradientCard';
import {RootState} from '../../store';

import Trip from '../../svg/Trip';
import Certification from '../../svg/Certification';
import Reminders from '../../svg/Reminders';

const stepperStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: colors.primary,
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: colors.primary,
  stepStrokeUnFinishedColor: '#dedede',
  separatorFinishedColor: colors.primary,
  separatorUnFinishedColor: '#dedede',
  stepIndicatorFinishedColor: colors.primary,
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 0,
  currentStepIndicatorLabelFontSize: 0,
  stepIndicatorLabelCurrentColor: 'transparent',
  stepIndicatorLabelFinishedColor: 'transparent',
  stepIndicatorLabelUnFinishedColor: 'transparent',
  labelColor: '#999999',
  labelSize: 13,
  currentStepLabelColor: colors.primary,
};

export default function Home({ navigation }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const kanjiState = useSelector((state: RootState) => state.kanji);
  const [open, setOpen] = useState({ open: false });

  const randomKanji = useMemo(() => {
    if (kanjiState.selectedKanji && Object.keys(kanjiState.selectedKanji).length > 0) {
      const kanjiKeys: Array<string> = Object.keys(kanjiState.selectedKanji);
      const random: number = Math.floor(Math.random() * kanjiKeys.length);
      const choosenKanji: Partial<KanjiType> = kanjiState.selectedKanji[kanjiKeys[random]];

      const icon = (props: any) => choosenKanji.kanji?.character && Platform.select({
        web: <List.Icon {...props} icon={{ uri: `https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}` }} />,
        native: <SvgUri width={32} height={32} uri={`https://www.miraisoft.de/anikanjivgx/?svg=${encodeURI(choosenKanji.kanji?.character)}`} />,
      })

      return (
        <List.Item title={choosenKanji.kanji?.character} description="See details" left={icon} onPress={() => navigation.navigate('KanjiDetail', { id: choosenKanji.kanji_id as string })} style={{ marginHorizontal: 20 }} />
        );
    }
    return null;
  }, [kanjiState]);

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
    const step = 1;
    return <Trip width={220} height={180} />;
  }, []);

  return (<SafeAreaView style={styles.main}>
    <View style={styles.header}>
      <Button mode="contained" style={{ borderRadius: 25 }}>4000</Button>
      <TouchableOpacity onPress={() => navigation.navigate('Settings', { firstTime: false })}>
        <Avatar.Text size={40} label="A" />
      </TouchableOpacity>
    </View>

    <ScrollView style={{ flex: 0.9 }} showsVerticalScrollIndicator={false} >
    <View>
      <Text style={{ marginLeft: 20, fontSize: 18, color: colors.text }}>Hello,</Text>
      <Text style={[styles.title, { marginTop: 0 }]}>Alexandreさん</Text>
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
          currentPosition={1}
          labels={labels}
        />
      </View>

      <Surface style={styles.surface}>
        <View style={{ marginHorizontal: 20 }}>
          {stepperIllustration}
        </View>
        <View style={{ margin: 10 }}>
          <Text style={{ color: colors.secondary, fontSize: 30, fontWeight: '800', marginHorizontal: 20 }}>Good Job !</Text>
          <Text style={[styles.title, { fontSize: 22, marginTop: 0 }]}>6000 pts</Text>
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
    actions={menu.map((m) => ({ ...m, onPress: () => navigation.navigate(m.screen, m.navOpt) }))}
    onStateChange={setOpen}
  />
</SafeAreaView>);
};

