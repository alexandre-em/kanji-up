import React from 'react';
import { SvgUri } from 'react-native-svg';

interface SvgUriPlatformProps {
  width: number;
  height: number;
  uri: string;
}

export default function SvgUriPlatform({ width, height, uri }: SvgUriPlatformProps) {
  return <SvgUri uri={uri} width={width} height={height} />;
}
