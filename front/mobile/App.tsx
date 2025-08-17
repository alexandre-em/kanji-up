import './src/services/http';

import { Dimensions, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { Colors, ThemeManager, Typography, View } from 'react-native-ui-lib';
import { setConfig } from 'react-native-ui-lib/config';
import { Provider } from 'react-redux';

import { ToasterProvider } from './src/providers/toaster';
import { RootNavigation } from './src/screens/router';
import store from './src/store';

setConfig({ appScheme: 'default' });

Colors.loadSchemes({
  light: {
    $backgroundDefault: '#f6eaeb20',
    $backgroundElevated: '#f6eaeb',
    $backgroundElevatedLight: '#F4E0E1',
    $backgroundPrimaryHeavy: '#d42528',
    $backgroundPrimaryMedium: '#f7d4d4',
    $backgroundPrimaryLight: '#fbe9ea',
    $backgroundGeneralHeavy: '#7e2526',
    $backgroundGeneralMedium: '#dd888a',
    $backgroundGeneralLight: '#f4d7d8',
    $backgroundDark: '#1E0A0B',
    $backgroundDarkElevated: '#1E0A0B',
    $textDefault: '#191010',
    $textPrimary: '#d42528',
    $textGeneral: '#7e2526',
    $textMajor: '#c92c2f',
    $iconPrimary: '#d42528',
    $iconPrimaryLight: '#f7d4d4',
    $iconGeneral: '#7e2526',
    $iconGeneralLight: '#dd888a',
    $outlinePrimary: '#d42528',
    $outlinePrimaryMedium: '#f7d4d4',
    $outlineGeneral: '#7e2526',
  },
  dark: {
    $backgroundDefault: '#15090a',
    $backgroundElevated: '#15090a',
    $backgroundElevatedLight: '#1E0A0B',
    $backgroundPrimaryHeavy: '#e87d7f',
    $backgroundPrimaryMedium: '#821719',
    $backgroundPrimaryLight: '#570f10',
    $backgroundGeneralHeavy: '#c6393c',
    $backgroundGeneralMedium: '#772224',
    $backgroundGeneralLight: '#4f1718',
    $backgroundDark: '#1E0A0B',
    $backgroundDarkElevated: '#1E0A0B',
    $textDefault: '#efe6e6',
    $textPrimary: '#e87d7f',
    $textGeneral: '#c6393c',
    $textMajor: '#d33639',
    $iconPrimary: '#e87d7f',
    $iconPrimaryLight: '#570f10',
    $iconGeneral: '#c6393c',
    $iconGeneralLight: '#4f1718',
    $outlinePrimary: '#e87d7f',
    $outlinePrimaryMedium: '#821719',
    $outlineGeneral: '#c6393c',
  },
});

ThemeManager.setComponentTheme('Text', (props) => {
  return {
    color: Colors.$textDefault,
  };
});

ThemeManager.setComponentTheme('View', (props) => {
  return {
    backgroundColor: Colors.$backgroundDefault,
  };
});

Typography.loadTypographies({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 25,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 17,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 17,
  },
  h4: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 17,
  },
  h5: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  },
  h6: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 32,
  },
  p1: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
  },
  p2: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
});

function App() {
  const theme = useColorScheme();

  Colors.setScheme('dark');

  return (
    <Provider store={store}>
      <ToasterProvider>
        <View style={styles.container} padding-20>
          <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
          <RootNavigation />
        </View>
      </ToasterProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight, // take in account the status bar
    height: Dimensions.get('window').height - (StatusBar.currentHeight ?? 0),
    width: Dimensions.get('window').width,
  },
});

export default App;
