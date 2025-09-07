import { Dimensions } from 'react-native';
import View from 'react-native-ui-lib/view';

import { GENERAL_MARGIN } from '../constants/styles';

type SpacingProps = {
  x?: number;
  y?: number;
};

const { width, height } = Dimensions.get('window');

export default function Spacing({ x = width, y = 1 }: SpacingProps) {
  return <View width={x} height={y} />;
}
