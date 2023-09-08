import * as React from 'react';
import { View } from 'react-native';

import { render, act } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/src/testing-library';
import { AuthProvider } from 'kanji-app-auth';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const FakeChild = () => {
  return <View testID="provider-child-view" />;
};

const createProvider = () => {
  return (
    <AuthProvider>
      <FakeChild />
    </AuthProvider>
  );
};

const MockComponent = jest.fn(() => <View />);

describe('AuthProvider', () => {
  it('must return true', () => {
    renderRouter(
      {
        index: createProvider,
        home: MockComponent,
      },
      {
        initialRoute: '/home',
      }
    );
    expect(screen).not.toHavePathname('/home');
    expect(screen).toHavePathname('/'); // user not logged, so redirect at root for signing in
  });
});
