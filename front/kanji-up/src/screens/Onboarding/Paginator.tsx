import React from 'react';
import { Animated, View, useWindowDimensions } from 'react-native';
import {colors} from '../../constants';
import { paginatorStyle } from './style';

export default function Paginator({ data, scrollX }: PaginatorProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={paginatorStyle.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        })

        return <Animated.View style={[paginatorStyle.dot, { width: dotWidth }]} key={i.toString()} />
      })}
    </View>
  );
};
