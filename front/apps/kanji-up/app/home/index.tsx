import React, { useState } from 'react';
import { Href, router } from 'expo-router';
import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, FAB, Searchbar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import styles from './style';
import globalStyles from '../../styles/global';
import { menu, list } from './constants';
import { colors } from '../../constants/Colors';
import RandomKanji from './components/randomKanji';
import Stepper from './components/stepper';
import { RootState } from '../../store';

import GradientCard from '../../components/GradientCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const settingsState = useSelector((state: RootState) => state.settings);
  const userState = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState({ open: false });

  const renderItem = ({ item }: { item: (typeof list)[0] }) => (
    <GradientCard
      onPress={() => router.replace(item.screen as Href<string>)}
      image={item.image}
      title={item.title}
      subtitle={item.subtitle}
      buttonTitle={item.buttonTitle}
    />
  );

  return (
    <SafeAreaView style={globalStyles.main}>
      <View style={globalStyles.header}>
        <Button mode="contained" style={{ borderRadius: 25 }}>
          {userState.totalScore}
        </Button>
        <TouchableOpacity onPress={() => router.replace('/settings')}>
          <Avatar.Text size={40} label={settingsState.username.charAt(0) || '-'} />
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
            style={{ width: '90%', borderRadius: 25 }}
            inputStyle={{ color: colors.text, fontSize: 15 }}
            onSubmitEditing={() => router.replace(`/search?search=${searchQuery}`)}
          />
        </View>

        <Stepper />

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
        fabStyle={{ backgroundColor: colors.secondary }}
        actions={menu.map((m) => ({
          ...m,
          onPress: () => router.replace(m.screen as Href<string>),
        }))}
        onStateChange={setOpen}
      />
      {/* dialog */}
    </SafeAreaView>
  );
}
