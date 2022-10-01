import React, {useCallback, useState} from 'react';
import {FlatList, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import {SvgUri} from 'react-native-svg';

import styles from './style';
import { menu, list, labels } from './const';
import {ActivityIndicator, Avatar, Button, Divider, FAB, List, Searchbar} from 'react-native-paper';
import colors from '../../constants/colors';
import {HomeProps} from '../../types/screens';
import GradientCard from '../../components/GradientCard';

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
  const [open, setOpen] = useState({ open: false });

  const randomKanjiIcon = useCallback((props) => false
    ? <ActivityIndicator style={{ marginRight: 15 }} />
    : Platform.select({
    web: <List.Icon {...props} icon={{ uri: `https://www.miraisoft.de/anikanjivgx/?svg=%E3%80%85` }} />,
    native: <SvgUri width={32} height={32} uri={`https://www.miraisoft.de/anikanjivgx/?svg=%E3%80%85`} />,
  }), []);

  const renderItem = ({ item }: any) => {
    return <GradientCard
      onPress={() => navigation.navigate(item.screen, item.screenOptions)}
      image={item.image}
      title={item.title}
      subtitle={item.subtitle}
      buttonTitle={item.buttonTitle}
    />
  }

  return (<SafeAreaView style={styles.main}>
    <View style={styles.header}>
      <Button mode="contained" style={{ borderRadius: 25 }}>4000</Button>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Avatar.Text size={40} label="A" />
      </TouchableOpacity>
    </View>

    <Divider />

    <ScrollView style={{ flex: 0.9 }}>
      <View style={styles.search}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ width: '90%' }}
          inputStyle={{ color: colors.text, fontSize: 15 }}
          onSubmitEditing={() => console.warn(searchQuery)}
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

      <Text style={styles.title}>Random</Text>
      <List.Item title="test" description="description" left={randomKanjiIcon} style={{ marginHorizontal: 20 }} />

      <Text style={styles.title}>Quick start</Text>
      <FlatList
        horizontal
        style={{ marginHorizontal: 20 }}
        data={list}
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

