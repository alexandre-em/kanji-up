import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Animated, View, ViewToken } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import data from './data';
import AsyncStorageKeys from '../../constants/asyncstorageKeys';
import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';
import {onboardingStyle} from './style';
import {OnboardingProps} from '../../types/screens';

export default function Onboarding({ navigation }: OnboardingProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const slidesRef = useRef<FlatList<any>>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    setCurrentIndex(viewableItems[0].index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: OnboardingItemProps) => (<OnboardingItem item={item} />);

  const handlePress = useCallback(async () => {
    if (currentIndex !== data.length - 1) {
      console.log('Next');
      if (slidesRef && slidesRef.current) {
        try {
          slidesRef.current.scrollToIndex({ index: 1 });
        } catch (e) {
          console.error(e);
        }
      } else {
        console.log('slidesRef is null booouuuuh');
      }
    } else {
      try {
        await AsyncStorage.setItem(AsyncStorageKeys.FIRST_TIME, 'false');
        navigation.navigate('Home');
      } catch {
        console.error('An error occured, please try later...');
      }
    }
  }, [navigation, slidesRef]);

  return (
    <View style={onboardingStyle.container}>
      <View style={{ display: 'flex', flex: 3 }}>
        <FlatList
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>
      <Paginator data={data} scrollX={scrollX} />
      <Button mode="contained" onPress={handlePress} style={onboardingStyle.button}>{currentIndex !== (data.length - 1) ? 'Next' : 'Begin'}</Button>
    </View>
  );
}

