import React from 'react';

type SpacerPropsType = {
  size: number;
  direction?: 'vertical' | 'horizontal';
};

const Spacer = ({ size, direction = 'vertical' }: SpacerPropsType) => {
  const spacerStyle = {
    display: direction === 'vertical' ? 'block' : 'inline-block',
    width: `${direction === 'horizontal' ? size : 0}rem`,
    height: `${direction === 'vertical' ? size : 0}rem`,
  };

  return <div style={spacerStyle} />;
};

export default Spacer;
