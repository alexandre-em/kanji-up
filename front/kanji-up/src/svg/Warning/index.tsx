import React from 'react';
import {Image} from 'react-native';

export default function Warning({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_warning_re_eoyh.svg')} />
};

