import React from 'react';
import {Image} from 'react-native';

export default function Reminders({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_reminders_re_gtyb.svg')} />
};

