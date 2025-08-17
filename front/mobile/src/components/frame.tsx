import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { Colors, View } from 'react-native-ui-lib';

type FrameProps = {
  width: number;
  height: number;
};

export default function Frame({ width, height, children }: FrameProps & PropsWithChildren) {
  if (!children) return null;
  return (
    <View style={[styles.frame, { borderColor: Colors.$textDefault }]}>
      <View style={styles.children}>{children}</View>
      <View
        style={[
          styles.frameInner,
          {
            width: width / 2,
            height: height,
            borderRightWidth: 0.5,
            borderColor: Colors.$textDefault + '75',
          },
        ]}
      />
      <View
        style={[
          styles.frameInner,
          {
            width: width,
            height: height / 2,
            borderBottomWidth: 0.5,
            borderColor: Colors.$textDefault + '50',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 0.75,
    position: 'relative',
  },
  frameInner: {
    position: 'absolute',
  },
  children: {
    zIndex: 10,
  },
});
