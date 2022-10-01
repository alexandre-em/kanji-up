import {
  Canvas,
  Path,
  SkFont,
  Skia,
  SkiaMutableValue,
  Text,
} from '@shopify/react-native-skia';
import {StyleSheet, View} from 'react-native';

export default function Chart({
  strokeWidth,
  radius,
  percentageComplete,
  targetPercentage,
}) {
  const innerRadius = radius - strokeWidth / 2;
  const targetText = `${targetPercentage * 100}`;

  const path = Skia.Path.Make();
  path.addCircle(radius, radius, innerRadius);

  return (
    <View style={styles.container}>
      <Canvas style={styles.container}>
        <Path
          path={path}
          color="orange"
          style="stroke"
          strokeJoin="round"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={percentageComplete}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
