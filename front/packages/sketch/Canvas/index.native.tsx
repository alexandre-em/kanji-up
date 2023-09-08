import React, { forwardRef } from 'react';
import CanvasM from 'react-native-canvas';

export default forwardRef((props, ref) => {
  return <CanvasM {...props} ref={ref} />;
});
