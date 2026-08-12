import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Label of the active tab in the floating bottom nav bar: fades up as the tab becomes active */
export default function TabLabel({ label }: { label: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 180 });
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 4 }],
  }));

  return (
    <Animated.Text style={[styles.label, style]} numberOfLines={1}>
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#fff',
  },
});
