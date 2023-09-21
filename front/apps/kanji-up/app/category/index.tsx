import React from 'react';
import { router } from 'expo-router';
import { Image, ScrollView, Text, Pressable, View } from 'react-native';
import { Appbar } from 'react-native-paper';

import styles from './style';
import globalStyles from '../../styles/global';
import category from './constants';

export default function Category() {
  return (
    <View style={globalStyles.main}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Category" titleStyle={{ color: '#fff', fontWeight: '700', fontSize: 17 }} />
      </Appbar.Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        {category.map((c) => (
          <Pressable onPress={() => router.push(`/kanjis?grade=${c.id}`)} key={`grade-${c.id}`} style={{ position: 'relative' }}>
            <Image source={c.image} style={styles.tileImage} />
            <Text style={styles.title}>
              {c.title} ({c.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
