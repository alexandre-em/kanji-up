import Svg, { Circle, Path } from 'react-native-svg';

type SearchProps = {
  size: number;
  color: string;
};

export default function Search({ size, color }: SearchProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
