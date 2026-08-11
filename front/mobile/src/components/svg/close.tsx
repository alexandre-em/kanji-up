import Svg, { Path } from 'react-native-svg';

type CloseProps = {
  size: number;
  color: string;
};

export default function Close({ size, color }: CloseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
