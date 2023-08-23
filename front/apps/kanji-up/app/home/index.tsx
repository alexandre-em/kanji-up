import React, { useCallback, useEffect, useState } from 'react';
import { Href, router } from 'expo-router';
import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, FAB, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncstorageKeys, useAuth } from 'kanji-app-auth';
import jwtDecode from 'jwt-decode';

import { RootState } from 'store';
import globalStyles from 'styles/global';
import { colors } from 'constants/Colors';
import GradientCard from 'components/GradientCard';
import { fileNames, readFile } from 'services/file';
import { kanji, settings } from 'store/slices';

import styles from './style';
import { menu, list } from './constants';
import RandomKanji from './components/randomKanji';
import Stepper from './components/stepper';
import { DecodedToken } from 'kanji-app-types';

export default function Home() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);
  const AuthContext = useAuth();
  const settingsState = useSelector((state: RootState) => state.settings);
  const userState = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState({ open: false });

  const loadSelectedKanji = useCallback(async () => {
    try {
      const contents = await readFile(fileNames.SELECTED_KANJI);
      dispatch(kanji.actions.initialize(contents));
    } catch (err) {
      // dispatch(error.actions.update({ message: err instanceof Error ? err.message : 'An error occurred' }));
      // dispatch(kanji.actions.updateStatus('error'));
    }
  }, []);

  // TODO: Put a modal (see expo doc) with the a quick tuto (old onboarding screen)
  useEffect(() => {
    loadSelectedKanji();
    AsyncStorage.getItem(asyncstorageKeys.FIRST_TIME)
      .then((res: string | null) => {
        if (res !== null) {
          const firstTime = JSON.parse(res as string);
          setIsFirstTime(firstTime);
          if (!firstTime) {
            readFile('userSettings').then((content) => dispatch(settings.actions.update(JSON.parse(content))));
          }
        } else {
          setIsFirstTime(true);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (AuthContext?.accessToken) {
      const decodedToken: DecodedToken = jwtDecode(AuthContext.accessToken);

      dispatch(settings.actions.update({ username: decodedToken.name }));
    }
  }, [AuthContext?.accessToken]);

  const renderItem = ({ item }: { item: (typeof list)[0] }) => (
    <GradientCard
      onPress={() => router.push(item.screen as Href<string>)}
      image={item.image}
      title={item.title}
      subtitle={item.subtitle}
      buttonTitle={item.buttonTitle}
    />
  );

  return (
    <SafeAreaView style={globalStyles.main}>
      <View style={globalStyles.header}>
        <Button mode="contained" style={{ borderRadius: 25 }}>
          {userState.totalScore}
        </Button>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Avatar.Text size={40} label={settingsState.username.charAt(0) || '-'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 0.9 }} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={{ marginLeft: 20, fontSize: 18, color: colors.text }}>Hello,</Text>
          <Text style={[globalStyles.title, { marginTop: 0 }]}>{settingsState.username}さん</Text>
        </View>
        <View style={styles.search}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[globalStyles.search, { width: '90%' }]}
            inputStyle={{ color: colors.text, fontSize: 15 }}
            onSubmitEditing={() => router.push(`/search?search=${searchQuery}`)}
          />
        </View>

        <Stepper />

        <Text style={globalStyles.title}>Random</Text>
        <RandomKanji />

        <Text style={globalStyles.title}>Quick start</Text>
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
        actions={menu.map((m) => ({
          ...m,
          onPress: () => router.push(m.screen as Href<string>),
        }))}
        onStateChange={setOpen}
      />
      {/* dialog */}
    </SafeAreaView>
  );
}
