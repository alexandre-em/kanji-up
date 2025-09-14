import './src/services/http';
import './src/config/rnui';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dimensions, StatusBar, StyleSheet, useColorScheme, View as RNView } from 'react-native';
import { Colors, View } from 'react-native-ui-lib';
import { Provider } from 'react-redux';

import { ToasterProvider } from './src/providers/toaster';
import { UserProvider } from './src/providers/user';
import RootNavigation from './src/screens/router';
import store from './src/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    },
  },
});

function App() {
  const theme = useColorScheme();

  Colors.setScheme('light');

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <ToasterProvider>
            <RNView style={styles.screen}>
              <View style={styles.container} padding-20>
                <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
                <RootNavigation />
              </View>
            </RNView>
          </ToasterProvider>
        </UserProvider>
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    height: Dimensions.get('window').height - (StatusBar.currentHeight || 0),
    width: Dimensions.get('window').width,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0, // take in account the status bar
    height: '100%',
    width: '100%',
  },
});

export default App;
