import React from 'react';
import {Image} from 'react-native';

export default function Certification({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_certification_re_ifll.svg')} />
};

