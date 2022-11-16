import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import SearchBar from '../../components/SearchBar';

const props = {
  handleSearch: jest.fn(),
}

describe('<SearchBar />', () => {
  const renderComponent = () => (render(<SearchBar {...props} />));
  const { getAllByRole } = renderComponent();
  const input = getAllByRole('searchbox');

  test('renders searchbar input', () => {
    expect(input.length).toBe(1);
  });

  test('Should change the value of the searchbar', () => {
    fireEvent.change(input[0], { target: { value: '絶景' } });
    expect((input[0] as HTMLInputElement).value).not.toBe('');
    expect((input[0] as HTMLInputElement).value).toBe('絶景');
  });

  test('Should delete the value', () => {
    fireEvent.change(input[0], { target: { value: '絶景' } });
    expect((input[0] as HTMLInputElement).value).toBe('絶景');
    fireEvent.change(input[0], { target: { value: '' } });
    expect((input[0] as HTMLInputElement).value).not.toBe('絶景');
    expect((input[0] as HTMLInputElement).value).toBe('');
  });
})
