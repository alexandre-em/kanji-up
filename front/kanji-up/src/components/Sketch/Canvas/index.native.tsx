import React, {forwardRef} from 'react';
import CanvasM from 'react-native-canvas';

export default forwardRef(({}, ref) => {
  return <CanvasM ref={ref} />
});
