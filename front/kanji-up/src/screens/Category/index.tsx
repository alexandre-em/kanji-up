import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {Appbar} from 'react-native-paper';

import styles from './style';
import category from './const';
import {CategoryProps} from '../../types/screens';

export default function Category({ navigation }: CategoryProps) {
  return (
    <SafeAreaView style={styles.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()}/>
        <Appbar.Content title="Category" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      </Appbar.Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        {category.map((c) => (
          <TouchableOpacity onPress={() => navigation.navigate('KanjiList', { grade: c.id }) } key={`grade-${c.id}`} style={{ position: 'relative' }}>
            <Image source={c.image} style={styles.tileImage} />
            <Text style={styles.title}>{c.title}</Text>
          </TouchableOpacity>
      ))}
    </ScrollView>
  </SafeAreaView>
)
}
