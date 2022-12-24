import React from 'react';

import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Provider } from 'react-redux';

import { colors } from './src/constants';
import Navigation from './src/screens/Navigation';
import store from './src/store';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  version: 3,
  myOwnProperty: true,
  colors: {
    ...DefaultTheme.colors,
    ...colors
  },
}

export type ThemeOverride = typeof theme;

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <Provider store={store}>
        <Navigation />
      </Provider>
    </PaperProvider>
  );
}

