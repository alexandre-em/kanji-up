import React, {forwardRef} from 'react';

export default forwardRef(({}, ref) => {
  return <canvas ref={ref} />
});

