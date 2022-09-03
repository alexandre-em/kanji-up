import React from "react";
import SvgPlatform from '../../components/SvgPlatform';

export default function Alert({ width, height } : SvgProps) {
  return <SvgPlatform width={width} height={height} source={require('./undraw_alert_re_j2op.svg')} />
}

