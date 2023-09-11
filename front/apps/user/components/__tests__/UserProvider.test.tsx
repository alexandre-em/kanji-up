import * as React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import UserProvider, { useUserContext } from '../UserProvider';
import actions from '../UserProvider/actions';

declare module 'react-native' {
  interface ViewProps {
    state?: object;
    onPress?: () => void;
  }
}

const FakeChild = () => {
  const UserContext = useUserContext();

  const handlePress = () => {
    UserContext.dispatch({ type: actions.UPDATE, payload: { name: 'test' } });
  };

  return <View testID="provider-child-view" state={UserContext.state} onPress={handlePress} />;
};

const createProvider = (value) => {
  return (
    <UserProvider initialState={value}>
      <FakeChild />
    </UserProvider>
  );
};

describe('UserProvider', () => {
  it('Shoud return user state with default value', () => {
    const { getByTestId } = render(createProvider(undefined));

    expect(getByTestId('provider-child-view').props.state).toStrictEqual({
      name: '',
      email: '',
      friends: [],
      permissions: [],
      created_at: '',
      user_id: '',
      deleted_at: '',
      applications: {
        kanji: { total_score: 0, scores: {}, progression: {} },
        word: { total_score: 0, scores: {}, progression: {} },
      },
    });
  });

  it('Shoud update user state when pressing', () => {
    const { getByTestId } = render(createProvider(undefined));

    const children = getByTestId('provider-child-view');

    expect(children.props.state.name).not.toBe('test');

    fireEvent.press(children);

    expect(children.props.state.name).toBe('test');
  });

  it('Shoud override user state', () => {
    const newState = {
      name: 'Test',
      email: 'test@test.me',
      friends: [],
      permissions: [],
      created_at: '',
      user_id: '',
      deleted_at: '',
      applications: {
        kanji: { total_score: 100, scores: {}, progression: {} },
        word: { total_score: 100, scores: {}, progression: {} },
      },
    };
    const { getByTestId } = render(createProvider(newState));

    expect(getByTestId('provider-child-view').props.state).toStrictEqual(newState);
  });
});
