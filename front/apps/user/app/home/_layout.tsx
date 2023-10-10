import React, { useCallback, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { router, useGlobalSearchParams } from 'expo-router';
import { Avatar, Button, Searchbar, Surface, TouchableRipple } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import core from 'kanji-app-core';
import { UserApplicationScore } from 'kanji-app-types';
import { asyncstorageKeys, useAuth, useKanjiAppAuth } from 'kanji-app-auth';

import style from './style';
import RankList from 'components/Rank';
import { useUserContext } from 'components/UserProvider';
import actions from 'components/UserProvider/actions';
import { applications, colors, endpointUrls } from 'constants';
import global from 'constants/style';
import AppGroupButton from 'components/AppGroupButton';

export default function Home() {
  const UserContext = useUserContext();
  const AuthContext = useAuth();
  const { logout } = useKanjiAppAuth();
  const [appType, setAppType] = React.useState<'kanji' | 'word'>('kanji');
  const { access_token } = useGlobalSearchParams();

  const refreshUserScore = useCallback(async () => {
    if (AuthContext?.accessToken) {
      const userProfile = await core.userService!.getProfile();
      if (userProfile.data.user_id) {
        const applications: UserApplicationScore = { kanji: undefined, word: undefined };

        if (userProfile.data.applications.kanji?.total_score) {
          applications.kanji = (await core.userService!.getUserScore(userProfile.data.user_id, 'kanji')).data;
        }
        if (userProfile.data.applications.word?.total_score) {
          applications.word = (await core.userService!.getUserScore(userProfile.data.user_id, 'word')).data;
        }

        const friends = (await core.userService!.getFollowingList(userProfile.data.user_id)).data;

        const payload = { ...userProfile.data, friends, applications };

        UserContext.dispatch({ type: actions.FETCH, payload });
      }
    }
  }, [core.userService, AuthContext?.accessToken]);

  const handleSignout = useCallback(async () => {
    await logout(process.env.EXPO_PUBLIC_AUTH_BASE_URL + '/auth/logout');
    AuthContext!.signOut();
  }, []);

  const avatarUri = React.useMemo(
    () => `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${UserContext.state.user_id}`,
    [UserContext.state.user_id]
  );

  useEffect(() => {
    if (AuthContext?.accessToken) {
      refreshUserScore();
    }
  }, [AuthContext?.accessToken]);

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
    <ScrollView>
      <SafeAreaView style={global.main}>
        <Button icon="logout" onPress={handleSignout} style={{ alignSelf: 'flex-end', marginVertical: 10 }}>
          Logout
        </Button>
        <View style={style.avatar}>
          <TouchableOpacity onPress={() => router.push(`/profile/${UserContext.state.user_id}`)}>
            {UserContext.state.user_id ? (
              <Avatar.Image size={150} source={{ uri: avatarUri }} />
            ) : (
              <Avatar.Text size={150} label={UserContext.state.name.charAt(0) || '-'} />
            )}
          </TouchableOpacity>
          <Text style={[global.title, { textTransform: 'capitalize', textAlign: 'center' }]}>{UserContext.state.name}</Text>
        </View>
        <View style={style.contents}>
          <Searchbar style={global.search} placeholder="Search user..." inputStyle={{ color: colors.text, fontSize: 15 }} />

          <Text style={global.title}>Applications</Text>

          <AppGroupButton appType={appType} setAppType={setAppType} applications={applications} />

          <Button style={{ marginTop: 20 }} onPress={() => Linking.openURL(applications[appType].url)}>
            Run {appType} app
          </Button>
          <Text style={global.title}>Ranking : {appType}</Text>
          <RankList type={appType} />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
