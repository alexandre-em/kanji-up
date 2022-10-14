import React from 'react';
import {Image} from 'react-native';

export default function Cancel({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_cancel_re_pkdm.svg')} />
};

