import React from "react";
import {SvgUri} from "react-native-svg";

interface SvgUriPlatformProps {
  width: number;
  height: number
  uri: string;
  style: any;
}

export default function SvgUriPlatform({ width, height, uri, style }: SvgUriPlatformProps) {
  return (
    <SvgUri uri={uri} width={width} height={height} style={[style]} />
    );
};

