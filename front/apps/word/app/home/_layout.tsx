import { Href, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { FAB, Searchbar } from 'react-native-paper';

import { Content, globalStyle } from 'kanji-app-ui';

import { colors } from 'constants';

import Header from './Header';
import Stepper from './Stepper';
import useHomeHook from './hook';
import { menu } from './constants';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [open, setOpen] = useState({ open: false });
  const { handleUserRedirection, userState } = useHomeHook();

  return (
    <Content>
      <Header />
      <ScrollView style={{ flex: 0.9 }} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={{ marginLeft: 20, fontSize: 18, color: colors.text }}>Hello,</Text>
          <Text style={[globalStyle(colors).title, { marginTop: 0 }]}>{userState.username}さん</Text>
        </View>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          <Searchbar
            placeholder="Search for a word"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[globalStyle(colors).search, { width: '90%' }]}
            inputStyle={{ color: colors.text, fontSize: 15 }}
            onSubmitEditing={() => router.push(`/search?search=${searchQuery}`)}
          />
        </View>
        <Stepper onPress={handleUserRedirection} />
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
    </Content>
  );
}
