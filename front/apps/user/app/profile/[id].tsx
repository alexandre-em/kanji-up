import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, ScrollView, FlatList } from 'react-native';
import { ActivityIndicator, Avatar, Button, Dialog, Divider, IconButton, List, TouchableRipple } from 'react-native-paper';
import { router, useGlobalSearchParams } from 'expo-router';

import core from 'kanji-app-core';
import { User, UserApplicationScore } from 'kanji-app-types';

import style from './style';
import { applications, colors, endpointUrls } from 'constants';
import global from 'constants/style';
import { useUserContext } from 'components/UserProvider';
import actions from 'components/UserProvider/actions';
import Chart from './Chart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncstorageKeys, useAuth } from 'kanji-app-auth';
import AppGroupButton from 'components/AppGroupButton';

const FOLLOWING_MODE = 'Following';
const FOLLOWER_MODE = 'Follower';

export default function Home() {
  const { id, access_token } = useGlobalSearchParams();
  const UserContext = useUserContext();
  const AuthContext = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [dialog, setDialog] = useState({ visible: false, mode: '' });
  const [followers, setFollowers] = useState<Partial<User>[]>([]);
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

  const isUserFriend = useCallback(
    (selectedUser: Partial<User>) =>
      UserContext.state.friends.map((userFriend) => userFriend.user_id).includes(selectedUser.user_id),
    [UserContext.state.friends]
  );

  const addRemoveFriend = useCallback(
    (updatedFriend: Partial<User>) => {
      console.log(updatedFriend);
      const isFriend = isUserFriend(updatedFriend);
      const payload = !isFriend
        ? { friends: [...UserContext.state.friends, { name: updatedFriend.name, user_id: updatedFriend.user_id }] }
        : { friends: UserContext.state.friends.filter(({ user_id }) => updatedFriend.user_id !== user_id) };

      !isFriend ? core.userService?.addFriend(updatedFriend.user_id!) : core.userService?.removeFriend(updatedFriend.user_id!);

      UserContext.dispatch({
        type: actions.UPDATE,
        payload,
      });

      console.log(dialog.mode);

      if (user?.user_id === UserContext.state.user_id) {
        setUser((prev) => ({ ...prev, friends: payload.friends }));
      }
    },
    [user, dialog.mode, UserContext.state.user_id]
  );

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
          Edit
        </Button>
      );
    const isFriend = isUserFriend(user);

    return (
      <Button
        mode={isFriend ? 'outlined' : 'contained'}
        style={{ alignSelf: 'flex-end', marginRight: 20 }}
        onPress={() => addRemoveFriend(user)}>
        {isFriend ? 'Unfollow' : 'Follow'}
      </Button>
    );
  }, [UserContext.state, user]);

  const getUser = useCallback(
    async (userId: string) => {
      if (userId && userId === UserContext.state.user_id) {
        setUser(UserContext.state);
      } else if (userId && core.userService) {
        const userProfile = await core.userService.getUserById(userId);
        if (userProfile.data.user_id) {
          const applications: UserApplicationScore = { kanji: undefined, word: undefined };

          if (userProfile.data.applications?.kanji?.total_score) {
            applications.kanji = (await core.userService!.getUserScore(userProfile.data.user_id, 'kanji')).data;
          }
          if (userProfile.data.applications?.word?.total_score) {
            applications.word = (await core.userService!.getUserScore(userProfile.data.user_id, 'word')).data;
          }

          const friends = (await core.userService!.getFollowingList(userProfile.data.user_id)).data;

          const payload = { ...userProfile.data, friends, applications };

          setUser(payload);
        }
      }
    },
    [core.userService, UserContext.state]
  );

  const getFollowers = useCallback(
    (id: string) => {
      if (core.userService) {
        core.userService.getFollowers(id).then(({ data }) => {
          setFollowers(data);
        });
      }
    },
    [core.userService, UserContext.state, user]
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

  const closeDialog = useCallback(() => {
    setDialog({ mode: '', visible: false });
  }, []);

  const friendDialog = useMemo(() => {
    if (!user) return null;

    return (
      <Dialog visible={dialog.visible} onDismiss={closeDialog}>
        <Dialog.Title>{dialog.mode} list</Dialog.Title>
        <Dialog.Content style={{ height: Dimensions.get('window').height * 0.8 }}>
          <ScrollView>
            <FlatList
              data={(dialog.mode === FOLLOWER_MODE ? followers : user.friends).map((friend) => ({
                user_id: friend.user_id,
                name: friend.name,
                isFriend: isUserFriend(friend),
              }))}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  left={() => (
                    <Avatar.Image
                      size={40}
                      source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${item.user_id}` }}
                    />
                  )}
                  right={() =>
                    item.user_id !== UserContext.state.user_id && (
                      <Button
                        mode={item.isFriend ? 'outlined' : 'contained'}
                        onPress={() => addRemoveFriend({ user_id: item.user_id, name: item.name })}>
                        {item.isFriend ? 'Unfollow' : 'Follow'}
                      </Button>
                    )
                  }
                  onPress={() => {
                    closeDialog();
                    router.push(`/profile/${item.user_id}`);
                  }}
                />
              )}
            />
          </ScrollView>
        </Dialog.Content>
      </Dialog>
    );
  }, [user, dialog, UserContext.state, followers]);

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
    if (id) {
      getUser(id as string);
      getFollowers(id as string);
    }
  }, [id]);

  if (!user)
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', height: Dimensions.get('window').height }}>
        <ActivityIndicator animating />
        <Text>Loading...</Text>
      </View>
    );

  return (
    <ScrollView>
      <SafeAreaView style={[global.main, { flexDirection: 'column' }]}>
        <IconButton
          icon="arrow-left-circle-outline"
          iconColor={colors.primary}
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start' }}
        />
        <View style={style.avatar}>
          <TouchableOpacity style={{ alignSelf: 'center' }}>
            <Avatar.Image size={150} source={{ uri: avatarUri }} />
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
            <TouchableRipple onPress={() => setDialog({ visible: true, mode: 'Following' })}>
              <View style={{ alignItems: 'center' }}>
                <Text style={style.numberText}>{user.friends.length}</Text>
                <Text style={{ textAlign: 'center' }}>Following</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple onPress={() => setDialog({ visible: true, mode: 'Follower' })}>
              <View style={{ alignItems: 'center' }}>
                <Text style={style.numberText}>{followers.length}</Text>
                <Text style={{ textAlign: 'center' }}>Followers</Text>
              </View>
            </TouchableRipple>
          </View>
          <Divider style={{ marginVertical: 15 }} />
          {followButton}
        </View>

        <View style={style.contents}>
          <Text style={global.title}>Stats</Text>
          <AppGroupButton appType={apptype} setAppType={setAppType} applications={applications} />
          <Chart user={user} apptype={apptype} />
        </View>

        {friendDialog}
      </SafeAreaView>
    </ScrollView>
  );
}
