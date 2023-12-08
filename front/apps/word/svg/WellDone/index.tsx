import React from 'react';
import { Image } from 'react-native';

export default function WellDone({ width, height }: SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_well_done_re_3hpo.svg')} />;
}
