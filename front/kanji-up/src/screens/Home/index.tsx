import React, {useState} from 'react';
import {Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';

import styles from './style';
import menu from './const';
import {Avatar, Button, Divider, FAB, Searchbar} from 'react-native-paper';
import colors from '../../constants/colors';
import {HomeProps} from '../../types/screens';
import Studying from '../../svg/Studying';
import Certification from '../../svg/Certification';

export default function Home({ navigation }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [open, setOpen] = useState({ open: false });

  return (<SafeAreaView style={styles.main}>
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Hello Alexandre !</Text>
        <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '700' }}>4000pts</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Avatar.Text size={40} label="A" />
      </TouchableOpacity>
    </View>

    <Divider />

    <ScrollView style={{ flex: 0.9 }}>
      <View style={styles.search}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ width: '90%' }}
          inputStyle={{ color: colors.text, fontSize: 15 }}
          onSubmitEditing={() => console.warn(searchQuery)}
        />
      </View>

      <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('./chart.png')} style={{ width: 250, height: 250 }} />
      </View>

      <View style={styles.cardGroup}>
        <View style={styles.card}>
          <Studying width={190} height={190} />
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Flashcard', { evaluation: false })}
            icon={menu[1].icon}
            style={{ borderRadius: 25 }}
          >
            Start learning
          </Button>
        </View>

        <View style={styles.card}>
          <Certification width={190} height={190} />
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Flashcard', { evaluation: true })}
            icon="check-circle"
            style={{ borderRadius: 25 }}
          >
            Evaluate
          </Button>
        </View>
      </View>
    </ScrollView>

    <FAB.Group
      visible
      open={open.open}
      icon={open.open ? 'close' : 'menu'}
      color="white"
      fabStyle={{ backgroundColor: colors.secondary }}
      actions={menu.map((m) => ({ ...m, onPress: () => navigation.navigate(m.screen, m.navOpt) }))}
      onStateChange={setOpen}
    />
  </SafeAreaView>);
};

