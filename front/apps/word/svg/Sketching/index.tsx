import React from 'react';
import { Image } from 'react-native';

export default function Sketching({ width, height }: SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_learning_sketching_nd4f.svg')} />;
}
