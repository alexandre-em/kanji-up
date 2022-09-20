import React from 'react';
import { Animated, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import colors from '../../constants/colors';

export default function Paginator({ data, scrollX }: PaginatorProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        })

        return <Animated.View style={[styles.dot, { width: dotWidth }]} key={i.toString()} />
      })}
    </View>
  );
};


const styles = StyleSheet.create({
  dot : {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginHorizontal: 8,
  },
  container: {
    flexDirection: 'row',
    height: 64,
  }
});

