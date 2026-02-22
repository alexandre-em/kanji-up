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
    <View style={[styles.frame, { width, height, borderColor: Colors.$textDefault }]}>
      <View style={styles.children}>{children}</View>
      <View
        style={[
          styles.frameInner,
          {
            width: width / 2,
            height: height,
            borderRightWidth: 0.5,
            borderColor: Colors.$textDefault + '75',
            zIndex: 100,
            backgroundColor: 'transparent',
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
            zIndex: 100,
            backgroundColor: 'transparent',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameInner: {
    position: 'absolute',
  },
  children: {
    zIndex: 10,
  },
});
