import React from 'react';
import {Image} from 'react-native';

export default function ProjectComplete({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_project_complete_lwss.svg')} />
};

