import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Animated, View, ViewToken } from 'react-native';
import { Button } from 'react-native-paper';
import {useDispatch} from 'react-redux';

import data from './data';
import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';
import {onboardingStyle} from './style';
import {OnboardingProps} from '../../types/screens';
import {error} from '../../store/slices';

export default function Onboarding({ navigation }: OnboardingProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const slidesRef = useRef<FlatList<any>>(null);
  const dispatch = useDispatch();

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    setCurrentIndex(viewableItems[0].index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: OnboardingItemProps) => (<OnboardingItem item={item} />);

  const handlePress = useCallback(() => {
    try {
      navigation.navigate('Settings', { firstTime: true });
    } catch {
      dispatch(error.actions.update('An error occured, please try later...'));
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
      {currentIndex === (data.length - 1) && <Button mode="contained" onPress={handlePress} style={onboardingStyle.button}>Begin</Button>}
    </View>
  );
}

