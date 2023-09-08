import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface SvgUriPlatformProps {
  width: number;
  height: number;
  uri: string;
  style?: StyleProp<ImageStyle>;
}

export default function SvgUriPlatform({ width, height, uri, style }: SvgUriPlatformProps) {
  return <Image source={{ uri }} style={[{ width, height }, style]} />;
}
