import React, { ForwardedRef, forwardRef } from 'react';

export default forwardRef((props, ref: ForwardedRef<HTMLCanvasElement>) => {
  return <canvas {...props} ref={ref} />;
});
