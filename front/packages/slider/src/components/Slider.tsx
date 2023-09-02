import React, { useCallback, useMemo } from 'react';
import { GestureResponderEvent, Platform, useWindowDimensions } from 'react-native';
import Svg, { Circle, Rect, Text } from 'react-native-svg';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  color: string;
  onValueChange: (newValue: number) => void;
}

export default function Slider({ value, min, max, color, onValueChange }: SliderProps) {
  const { width } = useWindowDimensions();
  const [isDragging, setIsDragging] = React.useState(false);
  const [pos, setPos] = React.useState<string | number>();

  const progressValue = useMemo(() => {
    return ((value - min) / max) * 100;
  }, [value, min, max]);

  const handlePressIn = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSlide = useCallback(
    (e: GestureResponderEvent | any) => {
      const x =
        Platform.OS === 'web'
          ? e.nativeEvent?.touches
            ? e.nativeEvent.touches[0].clientX
            : e.nativeEvent.layerX
          : e.nativeEvent.locationX;
      if (isDragging) {
        setPos(x);
      }
    },
    [isDragging, value, max, min]
  );

  const handlePressOut = useCallback(() => {
    if (isDragging && pos) {
      const newValuePerc = ((pos as number) / (Math.min(width, 700) - 20)) * 100;
      onValueChange(Math.floor((newValuePerc * max) / 100 + min));
      setIsDragging(false);
    }
  }, [pos, min, max]);

  React.useEffect(() => {
    setPos(`${progressValue}%`);
  }, [progressValue]);

  return (
    <Svg
      viewBox={`0 0 ${Math.min(width, 700) - 20} 50`}
      onMouseMove={handleSlide}
      onTouchMove={handleSlide}
      onMouseUp={handlePressOut}
      onTouchEnd={handlePressOut}
      onMouseDown={handlePressIn}
      onTouchStart={handlePressIn}
      height={50}>
      <Text x={(Math.min(width, 700) - 20) / 2} y={20} textAnchor="middle" fontWeight="bold" fontFamily="RobotoBold" fill={color}>
        {value}
      </Text>
      <Text x={10} y={20} fontWeight="bold" fontFamily="Roboto" textAnchor="middle">
        {min}
      </Text>
      <Text x={Math.min(width, 700) - 35} y={20} fontWeight="bold" fontFamily="Roboto" textAnchor="middle">
        {max + min}
      </Text>
      <Rect x={0} y={30} width={`${progressValue}%`} height={5} rx={3} fill={color} />
      <Rect x={`${progressValue}%`} y={30} width={`${100 - progressValue}%`} height={5} rx={3} fill={color} />
      <Circle cx={pos} cy={32} r="12" fill={color} />
    </Svg>
  );
}
