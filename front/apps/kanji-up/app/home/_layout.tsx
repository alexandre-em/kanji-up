import React, { useCallback, useEffect, useState } from 'react';
import { Href, router, useGlobalSearchParams } from 'expo-router';
import { Pressable, FlatList, ScrollView, Text, View } from 'react-native';
import { Avatar, Button, FAB, List, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogRocket from '@logrocket/react-native';

import core from 'kanji-app-core';
import { asyncstorageKeys, useAuth } from 'kanji-app-auth';
import { Content, GradientCard } from 'kanji-app-ui';

import { RootState } from 'store';
import globalStyles from 'styles/global';
import { endpointUrls, colors } from 'constants';
import { fileNames, readFile } from 'services/file';
import { UserAppRedirection } from 'services/redirections';
import { kanji, settings, user } from 'store/slices';

import styles from './style';
import { menu, list } from './constants';
import RandomKanji from './components/randomKanji';
import Stepper from './components/stepper';

export default function Home() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>('');
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
          const date = new Date();
          const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

          LogRocket.identify(data.user_id, {
            name: data.name,
            email: data.email,
          });

          dispatch(settings.actions.update({ username: data.name, userId: data.user_id }));

          core.userService?.getUserScore(data.user_id, 'kanji').then((score) => {
            dispatch(
              user.actions.update({
                totalScore: score.data.total_score,
                dailyScore: score.data.scores[formattedDate],
                scores: score.data.scores,
                progression: score.data.progression,
              })
            );
          });
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
      disabled={false}
    />
  );

  useEffect(() => {
    loadSelectedKanji();
    readFile('userSettings')
      .then((content) => dispatch(settings.actions.update(JSON.parse(content))))
      .catch(() => console.log('previous setting not found'));

    core.recognitionService
      ?.health()
      .then(({ status }) => setRecognitionColor(status === 200))
      .catch(() => setRecognitionColor(false));

    refreshUserScore();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(asyncstorageKeys.FIRST_TIME).then((res) => {
      if (!res) {
        router.push('/Onboarding');
      }
    });
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
    <Content>
      <View style={globalStyles.header}>
        <Button mode="contained" style={{ borderRadius: 25 }}>
          {userState.totalScore}
        </Button>
        <Pressable onPress={() => router.push('/settings')}>
          {userId ? (
            <Avatar.Image size={40} source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${userId}` }} />
          ) : (
            <Avatar.Text size={40} label={settingsState.username.charAt(0) || '-'} />
          )}
        </Pressable>
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

        <Stepper onPress={() => UserAppRedirection(userId, AuthContext?.accessToken || '')} />

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
    </Content>
  );
}
