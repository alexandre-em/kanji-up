import React from 'react';
import {Image} from 'react-native';

export default function HomeScreen({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_home_screen_re_640d.svg')} />
};

