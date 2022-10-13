import React from "react";
import {Image} from "react-native";

interface SvgUriPlatformProps {
  width: number;
  height: number
  uri: string;
  style?: any;
}

export default function SvgUriPlatform({ width, height, uri }: SvgUriPlatformProps) {
  return (
    <Image source={{ uri }} style={[{ width, height }]} />
    );
};

