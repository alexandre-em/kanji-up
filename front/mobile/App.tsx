import './src/services/http';
import './src/config/rnui';

import { useEffect } from 'react';
import { Dimensions, StatusBar, StyleSheet, useColorScheme, View as RNView } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors, View } from 'react-native-ui-lib';
import { Provider } from 'react-redux';

import { TabBarProvider } from './src/providers/tabBar';
import { ToasterProvider } from './src/providers/toaster';
import { UserProvider } from './src/providers/user';
import RootNavigation from './src/screens/router';
import { gatherAdsConsent } from './src/services/ads/consent';
import store from './src/store';

function App() {
  const theme = useColorScheme();

  Colors.setScheme('light');

  useEffect(() => {
    // Ads must never be requested before consent is gathered (Play Store policy, UMP/GDPR) —
    // initialize() is what makes the SDK ready to actually serve requests afterward
    gatherAdsConsent().then((canRequestAds) => {
      if (canRequestAds) mobileAds().initialize();
    });
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <UserProvider>
          <ToasterProvider>
            <TabBarProvider>
              <RNView style={styles.screen}>
                <View style={styles.container}>
                  <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
                  <RootNavigation />
                </View>
              </RNView>
            </TabBarProvider>
          </ToasterProvider>
        </UserProvider>
      </Provider>
    </SafeAreaProvider>
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
