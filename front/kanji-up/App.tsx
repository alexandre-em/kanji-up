import React from 'react';

import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import colors from './src/constants/colors';
import Navigation from './src/screens/Navigation';

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
      <Navigation />
    </PaperProvider>
  );
}

