import React from 'react';
import {Image} from 'react-native';

export default function Studying({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_studying_re_deca.svg')} />
};

