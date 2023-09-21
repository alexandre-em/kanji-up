import { View, Text, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Button } from 'react-native-paper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import initStyle from './style';
import DefaultSliderItem from './components/DefaultSliderItem';

export default function Onboarding({ data, onFinish, colors }) {
  const width = Math.min(Dimensions.get('window').width, 700);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const styles = initStyle(colors);

  const flatListRef = useRef<FlatList>(); // a reference of flatList to call its scrollToIndex function

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const ind = event.nativeEvent.contentOffset.x / width;
    const roundIndex = Math.round(ind);
    setSlideIndex(roundIndex); // update slideIndex when flatList is scrolled
  }, []);

  const onNext = useCallback(() => {
    if (flatListRef?.current?.scrollToIndex && slideIndex < data.length - 1) {
      flatListRef.current?.scrollToIndex({ animated: true, index: slideIndex + 1 });
    }
  }, [flatListRef.current?.scrollToIndex, slideIndex]);

  const onReset = useCallback(() => {
    flatListRef.current?.scrollToIndex({ animated: true, index: 0 });
    setSlideIndex(0);
  }, [flatListRef.current?.scrollToIndex]);

  return (
    <>
      <FlatList
        data={data}
        renderItem={({ item }) => <DefaultSliderItem item={item} styles={styles} />}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={32}
        ref={flatListRef}
        style={{ flex: 1, maxWidth: 700 }}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
        initialScrollIndex={0}
      />
      <View style={styles.buttons}>
        {slideIndex + 1 < data.length ? <Button onPress={onFinish}>Skip</Button> : <Button onPress={onReset}>Reset</Button>}
        <Pressable onPress={slideIndex + 1 < data.length ? onNext : onFinish}>
          <AnimatedCircularProgress
            size={57}
            width={7}
            fill={((slideIndex + 1) / data.length) * 100}
            tintColor={colors.primary}
            backgroundColor={colors.primary + '75'}>
            {() => (
              <Text style={{ color: colors.text, fontWeight: '900' }}>{slideIndex + 1 < data.length ? 'Next' : 'Done'}</Text>
            )}
          </AnimatedCircularProgress>
        </Pressable>
      </View>
    </>
  );
}
