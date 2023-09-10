import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { ActivityIndicator, Avatar, Button, Divider, IconButton, SegmentedButtons } from 'react-native-paper';
import { router, useGlobalSearchParams } from 'expo-router';

import core from 'kanji-app-core';
import { User } from 'kanji-app-types';

import style from './style';
import { colors, endpointUrls } from 'constants';
import global from 'constants/style';
import { useUserContext } from 'components/UserProvider';
import actions from 'components/UserProvider/actions';
import Chart from './Chart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncstorageKeys, useAuth } from 'kanji-app-auth';

export default function Home() {
  const { id, access_token } = useGlobalSearchParams();
  const UserContext = useUserContext();
  const AuthContext = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [apptype, setAppType] = useState<'kanji' | 'word'>('kanji');

  const avatarUri = React.useMemo(
    () => `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${user?.user_id}`,
    [user?.user_id]
  );

  const joinedDate = useMemo(() => {
    if (!user?.created_at) return null;
    const date = new Date(user?.created_at);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-en', options);

    return <Text style={{ textAlign: 'center', color: colors.text + '70' }}>Joined the {formattedDate}</Text>;
  }, [user?.created_at]);

  const followButton = useMemo(() => {
    if (!user) return null;
    if (UserContext.state.user_id === user?.user_id)
      return (
        <Button
          mode="contained"
          style={{ alignSelf: 'flex-end', marginRight: 20 }}
          onPress={() => {
            router.push('/settings');
          }}>
          Settings
        </Button>
      );
    if (UserContext.state.friends.filter((u) => u.user_id === user?.user_id).length === 0)
      return (
        <Button
          mode="contained"
          style={{ alignSelf: 'flex-end', marginRight: 20 }}
          onPress={() => {
            core.userService?.addFriend(user.user_id);
            UserContext.dispatch({
              type: actions.UPDATE,
              payload: { friends: [...UserContext.state.friends, { name: user.name, user_id: user.user_id }] },
            });
          }}>
          Follow
        </Button>
      );
    else
      return (
        <Button
          mode="outlined"
          style={{ alignSelf: 'flex-end', marginRight: 20 }}
          onPress={() => {
            core.userService?.removeFriend(user.user_id);
            UserContext.dispatch({
              type: actions.UPDATE,
              payload: { friends: UserContext.state.friends.filter(({ user_id }) => user.user_id !== user_id) },
            });
          }}>
          Unfollow
        </Button>
      );
  }, [UserContext.state, user]);

  const getUser = useCallback(
    (userId: string) => {
      if (userId && userId === UserContext.state.user_id) {
        setUser(UserContext.state);
      } else if (userId && core.userService) {
        core.userService.getUserById(userId).then(({ data }) => {
          setUser(data);
        });
      }
    },
    [core.userService, UserContext.state]
  );

  const getCurrentUser = useCallback(() => {
    if (access_token && core.userService) {
      core.userService?.getProfile().then(({ data }) => {
        if (data.user_id) {
          UserContext.dispatch({ type: actions.FETCH, payload: data });
        }
      });
    }
  }, [core.userService, access_token]);

  useEffect(() => {
    if (access_token) {
      if (AuthContext?.signIn) {
        AsyncStorage.setItem(asyncstorageKeys.ACCESS_TOKEN, access_token as string);
        AuthContext.signIn(access_token as string);
        core.init(endpointUrls, access_token as string);
      }
      getCurrentUser();
    }
  }, [access_token, AuthContext?.signIn]);

  useEffect(() => {
    getUser(id as string);
  }, [id]);

  if (!user)
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', height: Dimensions.get('window').height }}>
        <ActivityIndicator animating />
        <Text>Loading...</Text>
      </View>
    );

  return (
    <SafeAreaView style={[global.main, { flexDirection: 'column' }]}>
      <IconButton
        icon="arrow-left-circle-outline"
        iconColor={colors.primary}
        onPress={() => router.back()}
        style={{ alignSelf: 'flex-start' }}
      />
      <View style={style.avatar}>
        <TouchableOpacity style={{ alignSelf: 'center' }}>
          {UserContext.state.user_id ? (
            <Avatar.Image size={150} source={{ uri: avatarUri }} />
          ) : (
            <Avatar.Text size={150} label={user.name.charAt(0) || '-'} />
          )}
        </TouchableOpacity>
        <Text style={[global.title, { textTransform: 'capitalize', textAlign: 'center' }]}>{user.name}</Text>
        {joinedDate}
        <Divider style={{ marginVertical: 15 }} />
        <View style={style.follow}>
          <View style={{ alignItems: 'center' }}>
            <Text style={style.numberText}>
              {(user.applications.kanji?.total_score || 0) + (user.applications.word?.total_score || 0)}
            </Text>
            <Text style={{ textAlign: 'center' }}>Points</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={style.numberText}>{user.friends.length}</Text>
            <Text style={{ textAlign: 'center' }}>Following</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={style.numberText}>{user.friends.length}</Text>
            <Text style={{ textAlign: 'center' }}>Followers</Text>
          </View>
        </View>
        <Divider style={{ marginVertical: 15 }} />
        {followButton}
      </View>
      <View style={style.contents}>
        <Text style={global.title}>Stats</Text>
        <SegmentedButtons
          value={apptype}
          onValueChange={setAppType}
          style={{ alignSelf: 'flex-end', borderRadius: 25, marginRight: 20 }}
          density="high"
          buttons={[
            {
              value: 'kanji',
              label: 'Kanji',
              checkedColor: colors.secondaryDark,
            },
            {
              value: 'word',
              label: 'Word',
              checkedColor: colors.secondaryDark,
            },
          ]}
        />
        <Chart user={user} apptype={apptype} />
      </View>
    </SafeAreaView>
  );
}
