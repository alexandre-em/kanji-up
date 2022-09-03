import React from 'react';
import { SvgXml } from 'react-native-svg';

export default function SvgPlatform({ width, height, source, style }: SvgPlatformProps) {
  return (
    <SvgXml xml={source} width={width} height={height} style={style} />
  )
}

