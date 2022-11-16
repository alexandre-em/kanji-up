import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import AppNav from '../../components/AppNav';

describe('<AppNav />', () => {
  const renderComponent = () => (render(
    <BrowserRouter>
      <AppNav />
    </BrowserRouter>
  ));
  const { getAllByRole } = renderComponent();

  test('Should render AppNav buttons', () => {
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(2);
  })
});
