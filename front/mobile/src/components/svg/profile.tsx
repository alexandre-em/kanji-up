import Svg, { Circle, Path } from 'react-native-svg';

type ProfileProps = {
  size: number;
  color: string;
};

export default function Profile({ size, color }: ProfileProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={2} />
      <Path d="M5 20a7 7 0 0 1 14 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
