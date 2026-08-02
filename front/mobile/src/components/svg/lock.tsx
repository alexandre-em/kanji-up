import Svg, { Path, Rect } from 'react-native-svg';

type LockProps = {
  size: number;
  color: string;
};

export default function Lock({ size, color }: LockProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
