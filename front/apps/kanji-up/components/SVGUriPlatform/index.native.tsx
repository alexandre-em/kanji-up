import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface SvgUriPlatformProps {
  width: number;
  height: number;
  uri: string;
  style: StyleProp<ImageStyle>;
}

export default function SvgUriPlatform({ width, height, uri, style }: SvgUriPlatformProps) {
  return <SvgUri uri={uri} width={width} height={height} style={style} />;
}
