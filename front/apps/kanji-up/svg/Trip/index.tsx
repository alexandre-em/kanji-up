import React from 'react';
import {Image} from 'react-native';

export default function Trip({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_trip_re_f724.svg')} />;
}
