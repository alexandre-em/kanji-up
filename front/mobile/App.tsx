import './src/services/http';
import './src/config/rnui';

import { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors, View } from 'react-native-ui-lib';
import { Provider } from 'react-redux';

import { NetworkProvider } from './src/providers/network';
import { TabBarProvider } from './src/providers/tabBar';
import { ToasterProvider } from './src/providers/toaster';
import { UserProvider } from './src/providers/user';
import RootNavigation from './src/screens/router';
import { gatherAdsConsent } from './src/services/ads/consent';
import store from './src/store';

function App() {
  const systemTheme = useColorScheme();
  const isDark = systemTheme === 'dark';

  Colors.setScheme(isDark ? 'dark' : 'light');

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
            <NetworkProvider>
              <TabBarProvider>
                {/* A single reactive View (not a plain RN View, which paints no background of its
                    own) so the whole window — including the strip behind the status/nav bars — picks
                    up the theme's background instead of leaking the native white window background */}
                <View style={styles.screen}>
                  <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={Colors.$backgroundDefault} />
                  <RootNavigation />
                </View>
              </TabBarProvider>
            </NetworkProvider>
          </ToasterProvider>
        </UserProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});

export default App;
