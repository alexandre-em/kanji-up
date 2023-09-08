import React, { useCallback, useEffect, useState } from 'react';
import { Href, router, useGlobalSearchParams } from 'expo-router';
import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, FAB, List, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncstorageKeys, useAuth } from 'kanji-app-auth';

import { RootState } from 'store';
import globalStyles from 'styles/global';
import { colors } from 'constants/Colors';
import GradientCard from 'components/GradientCard';
import { fileNames, readFile } from 'services/file';
import { kanji, settings, user } from 'store/slices';

import styles from './style';
import { menu, list } from './constants';
import RandomKanji from './components/randomKanji';
import Stepper from './components/stepper';
import core from 'kanji-app-core';
import { endpointUrls } from 'constants';

export default function Home() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [recognitionColor, setRecognitionColor] = useState<boolean>(false);
  const AuthContext = useAuth();
  const settingsState = useSelector((state: RootState) => state.settings);
  const userState = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState({ open: false });
  const { access_token } = useGlobalSearchParams();

  const loadSelectedKanji = useCallback(async () => {
    try {
      const contents = await readFile(fileNames.SELECTED_KANJI);
      dispatch(kanji.actions.initialize(contents));
    } catch (err) {
      // dispatch(error.actions.update({ message: err instanceof Error ? err.message : 'An error occurred' }));
      // dispatch(kanji.actions.updateStatus('error'));
    }
  }, []);

  const refreshUserScore = useCallback(() => {
    core.userService
      ?.getProfile()
      .then(({ data }) => {
        if (data.applications?.kanji) {
          setUserId(data.user_id);
          const scores = data.applications.kanji;
          const date = new Date();
          const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

          dispatch(settings.actions.update({ username: data.name }));

          dispatch(
            user.actions.update({
              totalScore: scores.total_score,
              dailyScore: scores.scores[formattedDate],
              scores: scores.scores,
              progression: scores.progression,
            })
          );
        }
      })
      .catch(() => router.replace('/'));
  }, [core.userService]);

  const renderItem = ({ item }: { item: (typeof list)[0] }) => (
    <GradientCard
      onPress={() => router.push(item.screen as Href<string>)}
      image={item.image}
      title={item.title}
      subtitle={item.subtitle}
      buttonTitle={item.buttonTitle}
    />
  );

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

    core.recognitionService
      ?.health()
      .then(({ status }) => setRecognitionColor(status === 200))
      .catch(() => setRecognitionColor(false));

    refreshUserScore();
  }, []);

  useEffect(() => {
    if (access_token) {
      if (AuthContext?.signIn) {
        AsyncStorage.setItem(asyncstorageKeys.ACCESS_TOKEN, access_token as string);
        AuthContext.signIn(access_token as string);
        core.init(endpointUrls, access_token as string);
      }
    }
  }, [access_token, AuthContext?.signIn]);

  return (
    <SafeAreaView style={globalStyles.main}>
      <View style={globalStyles.header}>
        <Button mode="contained" style={{ borderRadius: 25 }}>
          {userState.totalScore}
        </Button>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          {userId ? (
            <Avatar.Image size={40} source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${userId}` }} />
          ) : (
            <Avatar.Text size={40} label={settingsState.username.charAt(0) || '-'} />
          )}
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

        <Stepper onRefresh={refreshUserScore} />

        <Text style={globalStyles.title}>Server health</Text>
        <List.Item
          title="Recognition service"
          left={() => <List.Icon icon="square-rounded" color={recognitionColor ? colors.success : 'lightgrey'} />}
          style={{ marginHorizontal: 20 }}
        />

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
        style={{ backgroundColor: !open.open ? colors.elevation.level0 : colors.elevation.level3 + 'B0' }}
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
