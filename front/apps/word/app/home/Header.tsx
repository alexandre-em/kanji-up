import { router } from 'expo-router';
import React from 'react';
import { View, Pressable } from 'react-native';
import { Avatar, Button } from 'react-native-paper';

import { globalStyle } from 'kanji-app-ui';
import { colors } from 'constants';
import { useSelector } from 'react-redux';
import { RootState } from 'store';

export default function Header() {
  const userState = useSelector((root: RootState) => root.user);

  return (
    <View style={globalStyle(colors).header}>
      <Button mode="contained" style={{ borderRadius: 25 }}>
        {userState.totalScore}
      </Button>
      <Pressable onPress={() => router.push('/settings')}>
        {userState.userId ? (
          <Avatar.Image
            size={40}
            source={{ uri: `${process.env.EXPO_PUBLIC_AUTH_BASE_URL}/users/profile/image/${userState.userId}` }}
          />
        ) : (
          <Avatar.Text size={40} label={userState.username.charAt(0) || '-'} />
        )}
      </Pressable>
    </View>
  );
}
