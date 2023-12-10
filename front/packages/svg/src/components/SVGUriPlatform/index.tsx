import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

interface SvgUriPlatformProps {
  width: number;
  height: number;
  uri: string;
  alt?: string;
}

export default function SvgUriPlatform({ width, height, uri, alt }: SvgUriPlatformProps) {
  const [error, setError] = useState<boolean>(false);

  if (error)
    return (
      <View style={{ width, height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: Math.min(width, height) * 0.9, fontWeight: '500', fontFamily: 'ZenMaruGothic' }}>{alt}</Text>
      </View>
    );

  return <Image source={{ uri }} width={width} height={height} style={[{ width, height }]} onError={() => setError(true)} />;
}
