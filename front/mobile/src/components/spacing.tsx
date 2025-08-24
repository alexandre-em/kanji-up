import { View } from 'react-native';

type SpacingProps = {
  x?: number;
  y?: number;
};

export default function Spacing({ x = 1, y = 1 }: SpacingProps) {
  return <View style={{ width: x, height: y }} />;
}
