import { Text, SafeAreaView } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { IconButton, Searchbar } from 'react-native-paper';
import { router, useGlobalSearchParams } from 'expo-router';

import core from 'kanji-app-core';
import { User } from 'kanji-app-types';

import { colors } from 'constants';
import global from 'constants/style';
import UserList from 'components/UserList';

export default function Search() {
  const [search, setSearch] = useState('');
  const { user } = useGlobalSearchParams();
  const [result, setResult] = useState<Partial<User>[]>([]);

  const searchUser = useCallback((searchInput: string) => {
    core.userService?.searchUser(searchInput).then((res) => {
      setResult(res.data);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setSearch(user as string);
      searchUser(user as string);
    }
  }, [user]);

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <IconButton
        icon="arrow-left-circle-outline"
        iconColor={colors.primary}
        onPress={() => router.back()}
        style={{ alignSelf: 'flex-start' }}
      />
      <Text style={global.title}>Search for {search}...</Text>
      <Searchbar
        style={global.search}
        placeholder="Search user..."
        inputStyle={{ color: colors.text, fontSize: 15 }}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={(e) => searchUser(e.nativeEvent.text)}
      />
      <Text style={global.title}>Results ({result.length > 0 && result.length}) :</Text>
      <UserList users={result} />
    </SafeAreaView>
  );
}
