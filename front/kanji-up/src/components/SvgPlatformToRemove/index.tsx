import React from 'react';
import { Image } from 'react-native';

export default function SvgPlatform({ width, height, source, style } : SvgPlatformProps) {
  return (
    <Image source={source} style={[{ width, height }, style]} /> 
  )
}

