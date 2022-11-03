import React from 'react';
import { useWindowDimensions, Text, View } from 'react-native';

import { onboardingItemStyle } from './style';

export default function OnboardingItem({ item }: OnboardingItemProps) {
  const { width, height } = useWindowDimensions();
  const Svg = item.image;

  return (
    <View style={[onboardingItemStyle.container, { width, height }]}>
      <View style={onboardingItemStyle.text}>
        <Text style={onboardingItemStyle.title}>{item.title}</Text>
        <Text style={onboardingItemStyle.description}>{item.description}</Text>
      </View>
      <Svg width={220} height={180} />
    </View>
  );
}
