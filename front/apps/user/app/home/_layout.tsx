import React, { useCallback, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useGlobalSearchParams } from 'expo-router';
import { Appbar, Avatar, Button, Searchbar, Surface, TouchableRipple } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import core from 'kanji-app-core';
import { asyncstorageKeys, useAuth } from 'kanji-app-auth';

import style from './style';
import RankList from 'components/Rank';
import { useUserContext } from 'components/UserProvider';
import actions from 'components/UserProvider/actions';
import { colors, endpointUrls } from 'constants';
import global from 'constants/style';

export default function Home() {
  const UserContext = useUserContext();
  const AuthContext = useAuth();
  const [appType, setAppType] = React.useState<'kanji' | 'word'>('kanji');
  const { access_token } = useGlobalSearchParams();

  const refreshUserScore = useCallback(() => {
    if (AuthContext?.accessToken) {
      core.userService?.getProfile().then(({ data }) => {
        if (data.user_id) {
          UserContext.dispatch({ type: actions.FETCH, payload: data });
        }
      });
    }
  }, [core.userService, AuthContext?.accessToken]);

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
    <SafeAreaView style={global.main}>
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
        <Text style={global.title}>Score</Text>
        <View style={style.score}>
          <TouchableRipple onPress={() => setAppType('kanji')}>
            <Surface
              style={[global.surface, { backgroundColor: appType === 'kanji' ? colors.elevation.level4 : '#fff' }]}
              elevation={4}>
              <Text style={{ fontFamily: 'RobotoBold', fontSize: 18 }}>Kanji</Text>
              <Text>{UserContext.state.applications.kanji?.total_score || 0}</Text>
            </Surface>
          </TouchableRipple>
          <TouchableRipple onPress={() => setAppType('word')}>
            <Surface
              style={[global.surface, { backgroundColor: appType === 'word' ? colors.elevation.level4 : '#fff' }]}
              elevation={4}>
              <Text style={{ fontFamily: 'RobotoBold', fontSize: 18 }}>Word</Text>
              <Text>{UserContext.state.applications.word?.total_score || 0}</Text>
            </Surface>
          </TouchableRipple>
        </View>
        <Text style={global.title}>Ranking</Text>
        <RankList type={appType} />
      </View>
    </SafeAreaView>
  );
}
