import React from 'react';
import { Text, FlatList, View } from 'react-native';

import data from './data';
import OnboardingItem from './OnboardingItem';
import { onboardingStyle } from './style';

export default function Onboarding() {
const renderItem = ({ item }: OnboardingItemProps) => (
    <OnboardingItem item={item} />
  );

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
}

