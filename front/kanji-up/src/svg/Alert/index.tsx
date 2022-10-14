import React from "react";
import {Image} from "react-native";

export default function Alert({ width, height } : SvgProps) {
  return <Image style={{ width, height }} source={require('./undraw_alert_re_j2op.svg')} />
}

