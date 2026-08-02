import { useHeaderHeight } from '@react-navigation/elements';
import { PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Text, View } from 'react-native-ui-lib';

import { GENERAL_MARGIN } from '../constants/styles';
import { useTabBarHidden } from '../providers/tabBar';
import { BANNER_AD_HEIGHT } from './bannerAd';
import { TAB_BAR_TOTAL_HEIGHT } from './bottomNavBar';
import Spacing from './spacing';

type LayoutProps = {
  screen?: string;
  /** Set on the screens displaying the floating tab bar, to keep their content above it */
  withTabBar?: boolean;
  /** Set on every screen showing the persistent banner ad, to keep their content above it */
  withBanner?: boolean;
};

const { height } = Dimensions.get('window');
/** Scroll distance ignored before hiding/showing the tab bar, to avoid flickering on small moves */
const SCROLL_THRESHOLD = 8;

export default function Layout({ screen, withTabBar, withBanner, children }: LayoutProps & PropsWithChildren) {
  const { t } = useTranslation();

  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const tabBarHidden = useTabBarHidden();
  const lastOffset = useSharedValue(0);

  const title = t(`${screen}.title`);
  const subtitle = t(`${screen}.subtitle`);

  // Keep the screen viewport above the floating tab bar, and leave room below the scrolled content
  const tabBarClearance = withTabBar ? TAB_BAR_TOTAL_HEIGHT + insets.bottom : 0;
  const bannerClearance = withBanner ? BANNER_AD_HEIGHT : 0;
  const bottomClearance = tabBarClearance + bannerClearance;

  // Entering a screen always resets the bar to visible
  useEffect(() => {
    if (tabBarHidden) tabBarHidden.value = withTiming(0);
  }, [tabBarHidden]);

  // Scrolling down slides the bar away, scrolling up brings it back
  const handleScroll = useAnimatedScrollHandler((event) => {
    if (!withTabBar || !tabBarHidden) return;

    const offset = event.contentOffset.y;
    const delta = offset - lastOffset.value;

    if (offset <= 0 || delta < -SCROLL_THRESHOLD) {
      tabBarHidden.value = withTiming(0, { duration: 200 });
    } else if (delta > SCROLL_THRESHOLD && offset > TAB_BAR_TOTAL_HEIGHT) {
      tabBarHidden.value = withTiming(1, { duration: 200 });
    }

    lastOffset.value = offset;
  });

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: bottomClearance + GENERAL_MARGIN }}
      onScroll={handleScroll}
      scrollEventThrottle={16}>
      <View style={{ minHeight: height - headerHeight - bottomClearance }}>
        <Spacing y={20} />
        {title !== `${screen}.title` && <Text h1>{title}</Text>}
        {title !== `${screen}.title` && subtitle !== `${screen}.subtitle` && <Spacing y={5} />}
        {subtitle !== `${screen}.subtitle` && <Text text80L>{t(`${screen}.subtitle`)}</Text>}
        {title !== `${screen}.title` && subtitle !== `${screen}.subtitle` && <Spacing y={10} />}
        {children}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.$backgroundDefault,
    paddingLeft: 20,
    paddingRight: 20,
  },
});
