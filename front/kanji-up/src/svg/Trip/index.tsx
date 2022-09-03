import React from 'react';
import SvgPlatform from '../../components/SvgPlatform/index.native';

export default function Trip({ width, height } : SvgProps) {
  return <SvgPlatform width={width} height={height} source={require('../Trip/undraw_trip_re_f724.svg')} />;
}
