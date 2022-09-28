import React, {useState} from 'react';
import {Image, SafeAreaView, Text, View} from 'react-native';

import styles from './style';
import menu from './const';
import {Avatar, Button, Searchbar} from 'react-native-paper';
import colors from '../../constants/colors';
import {HomeProps} from '../../types/screens';

export default function Home({ navigation }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  return (<SafeAreaView style={styles.main}>
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        <Text style={{ fontSize: 18 }}>Hello Alexandre !</Text>
        <Text style={{ fontSize: 15, color: colors.primaryDark, fontWeight: '700' }}>4000pts</Text>
      </View>
      <Avatar.Text size={40} label="A" />
    </View>

    <View style={styles.search}>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ width: '90%' }}
        inputStyle={{ fontWeight: '100' }}
        onSubmitEditing={() => console.warn(searchQuery)}
      />
    </View>

    <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('./chart.png')} style={{ width: 250, height: 250 }} />
    </View>

    <View style={styles.menu}>
      {menu.map((m) => (<Button key={m.title} icon={m.icon} mode="contained" onPress={() => navigation.navigate(m.screen)} labelStyle={{ fontWeight: '700' }} style={styles.button}>{m.title}</Button>))}
    </View>
  </SafeAreaView>);
};

