import { FlatList } from 'react-native';
import React from 'react';
import { User } from 'kanji-app-types';
import { Avatar, Button, Divider, List } from 'react-native-paper';
import { useUserContext } from 'components/UserProvider';
import useUserHooks from 'components/UserProvider/hook';
import { router } from 'expo-router';

export default function UserList({
  users,
  onPress = (user) => router.push(`/profile/${user.user_id}`),
}: {
  users: Partial<User>[];
  onPress?: (user: Partial<User>) => void;
}) {
  const UserContext = useUserContext();
  const { isUserFriend, addRemoveFriend } = useUserHooks();

  return (
    <FlatList
      bounces
      ItemSeparatorComponent={() => <Divider />}
      data={users.map((friend) => ({
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
          onPress={() => onPress(item)}
        />
      )}
    />
  );
}
