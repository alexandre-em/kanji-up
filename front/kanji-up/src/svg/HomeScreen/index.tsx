import React from 'react';
import SvgPlatform from '../../components/SvgPlatform';

export default function HomeScreen({ width, height } : SvgProps) {
  return <SvgPlatform width={width} height={height} source={require('./undraw_home_screen_re_640d.svg')} />
};

