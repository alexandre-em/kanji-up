import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Assets, Button, Colors } from 'react-native-ui-lib';

/**
 * Convert a list of points into a smooth quadratic Bezier SVG path.
 * @param {Array<{x:number, y:number}>} points
 */
function pointsToSvgPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const { x, y } = points[0];
    return `M ${x} ${y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
  }

  // last line to the final point
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;

  return d;
}

type CanvasProps = {
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  hideBackground?: boolean;
};

const Canvas = forwardRef(({ width = 300, height = 300, strokeWidth = 3, color = 'black', hideBackground }: CanvasProps, ref) => {
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPoints([]);
  }, []);

  useImperativeHandle(ref, () => ({
    clear: handleClear,
  }));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPoints([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPoints((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
          if (currentPoints.length > 0) {
            setPaths((prev) => [...prev, currentPoints]);
          }
          setCurrentPoints([]);
        },
        onPanResponderTerminate: () => {
          if (currentPoints.length > 0) {
            setPaths((prev) => [...prev, currentPoints]);
          }
          setCurrentPoints([]);
        },
      }),
    [currentPoints],
  );

  return (
    <View {...panResponder.panHandlers} style={[{ width, height }, styles.canvas, hideBackground ? {} : styles.canvasBackground]}>
      <Button
        iconSource={Assets.icons.clear}
        iconProps={{ size: 25 }}
        onPress={handleClear}
        outline
        size="medium"
        style={styles.clean}
      />
      <Svg width={width} height={height}>
        {paths.map((points, i) => (
          <Path
            key={i}
            d={pointsToSvgPath(points)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentPoints.length > 0 && (
          <Path
            d={pointsToSvgPath(currentPoints)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
      <View style={styles.vertical} />
      <View style={styles.horizontal} />
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    position: 'relative',
    borderWidth: 0.75,
    borderColor: Colors.$textDefault + '50',
    borderRadius: 8,
  },
  canvasBackground: {
    backgroundColor: '#fff',
  },
  vertical: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRightWidth: 0.5,
    borderRightColor: Colors.$textDefault + '25',
  },
  horizontal: {
    position: 'absolute',
    height: '50%',
    width: '100%',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.$textDefault + '25',
  },
  clean: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 35,
    height: 35,
    zIndex: 100,
  },
});

export default Canvas;
