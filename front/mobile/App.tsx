import './src/services/http';
import './src/config/rnui';

import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors, View } from 'react-native-ui-lib';
import { Provider } from 'react-redux';

import { NetworkProvider } from './src/providers/network';
import { TabBarProvider } from './src/providers/tabBar';
import { ThemeProvider, useThemePreference } from './src/providers/theme';
import { ToasterProvider } from './src/providers/toaster';
import { UserProvider } from './src/providers/user';
import RootNavigation from './src/screens/router';
import { gatherAdsConsent } from './src/services/ads/consent';
import store from './src/store';

function AppContent() {
  // Colors.setScheme() itself is applied by ThemeProvider, not here — see its own comment for why
  const { isDark } = useThemePreference();

  useEffect(() => {
    // Ads must never be requested before consent is gathered (Play Store policy, UMP/GDPR) —
    // initialize() is what makes the SDK ready to actually serve requests afterward
    gatherAdsConsent().then((canRequestAds) => {
      if (canRequestAds) mobileAds().initialize();
    });
  }, []);

  return (
    <UserProvider>
      <ToasterProvider>
        <NetworkProvider>
          <TabBarProvider>
            {/* A single reactive View (not a plain RN View, which paints no background of its
                own) so the whole window — including the strip behind the status/nav bars — picks
                up the theme's background instead of leaking the native white window background */}
            <View style={styles.screen}>
              <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={Colors.$backgroundDefault} />
              {/* Colors.setScheme() mutates RNUI's global color state — it doesn't itself trigger
                  React re-renders, and react-native-screens' own optimizations keep already-mounted
                  screens from picking up the change on their own. Remounting on scheme flip (this
                  resets navigation to its initial route, an accepted cost for a rare, deliberate
                  settings action) is what actually makes every screen repaint correctly. */}
              <RootNavigation key={isDark ? 'dark' : 'light'} />
            </View>
          </TabBarProvider>
        </NetworkProvider>
      </ToasterProvider>
    </UserProvider>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
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
