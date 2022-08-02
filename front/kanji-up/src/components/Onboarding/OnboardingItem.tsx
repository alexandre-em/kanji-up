import React from 'react';
import { Image, useWindowDimensions, Text, View } from 'react-native';

import { onboardingItemStyle } from './style';

export default function OnboardingItem({ item }: OnboardingItemProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={[onboardingItemStyle.container, { width }]}>
      <Image source={item.image} style={[onboardingItemStyle.image, { width, resizeMode: 'contain' }]} />
      <View style={onboardingItemStyle.text}>
        <Text style={onboardingItemStyle.title}>{item.title}</Text>
        <Text style={onboardingItemStyle.description}>{item.description}</Text>
      </View>
    </View>
  );
}

