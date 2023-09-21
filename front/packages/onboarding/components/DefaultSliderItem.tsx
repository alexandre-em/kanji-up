import { View, Text, useWindowDimensions, Image } from 'react-native';
import React from 'react';

export default function DefaultSliderItem({ item, styles }) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={[styles.container, { width: Math.min(width, 700), padding: 20 }]}>
      <Image
        style={[
          styles.image,
          {
            width: Math.min(width, 700) * 0.5,
            height: height * 0.5,
            maxWidth: 700,
          },
        ]}
        source={item.image}
        alt={item.title}
        resizeMode="contain"
      />
      <Text style={styles.title}> {item.title} </Text>
      <Text style={styles.body}> {item.subtitle} </Text>
    </View>
  );
}
