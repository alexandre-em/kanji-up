import React from 'react';
import { Image } from 'react-native';

export default function Pancake({ width, height }: SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_pancakes_238t.svg')} />;
}
