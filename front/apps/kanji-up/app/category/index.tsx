import React from 'react';
import { router } from 'expo-router';
import { Image, ScrollView, Text, Pressable } from 'react-native';

import { Content } from 'kanji-app-ui';

import styles from './style';
import category from './constants';

export default function Category() {
  return (
    <Content header={{ title: 'Category', onBack: () => router.back() }}>
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
    </Content>
  );
}
