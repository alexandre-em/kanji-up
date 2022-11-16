import React, {createRef} from 'react';
import { render } from '@testing-library/react';

import Sketch, {SketchFunctions} from '../../components/Sketch';

describe('<Sketch />', () => {
  const ref = createRef();
  const renderComponent = () => render(<Sketch ref={ref} visible />);
  const { getByTestId } = renderComponent();
  const sketch = (getByTestId('sketch-canvas'));

  test('Should render canvas and its ref is not null', () => {
    expect(sketch).not.toBeNull();
    expect(ref.current).not.toBeNull();
    expect((ref.current as SketchFunctions).strokeCount).toBe(0);
  });
});
