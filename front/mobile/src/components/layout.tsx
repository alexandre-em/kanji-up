import { useHeaderHeight } from '@react-navigation/elements';
import { PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Text, View } from 'react-native-ui-lib';

import { GENERAL_MARGIN } from '../constants/styles';
import { useAppSelector } from '../hooks/useStore';
import { useTabBarHidden } from '../providers/tabBar';
import { selectUserState } from '../store/slices/user';
import AppBannerAd from './bannerAd';
import { TAB_BAR_TOTAL_HEIGHT } from './bottomNavBar';
import Spacing from './spacing';

type LayoutProps = {
  screen?: string;
  /** Set on the screens displaying the floating tab bar, to keep their content above it */
  withTabBar?: boolean;
  /** Shows a centered spinner + this message in place of children, for screens whose content
   * depends on an async fetch (e.g. a detail page keyed by a route param) that hasn't resolved
   * yet — omit (or pass an empty string) to render children normally */
  loadingMessage?: string;
  /** Shows this message in place of children when a fetch the screen depends on has failed —
   * for a plain "couldn't load" message only; a screen that also needs a Retry action keeps its
   * own hand-rolled error block instead, since this prop takes no callback */
  errorMessage?: string;
};

const { height } = Dimensions.get('window');
/** Scroll distance ignored before hiding/showing the tab bar, to avoid flickering on small moves */
const SCROLL_THRESHOLD = 8;

export default function Layout({ screen, withTabBar, loadingMessage, errorMessage, children }: LayoutProps & PropsWithChildren) {
  const { t } = useTranslation();

  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const userState = useAppSelector(selectUserState);
  const hideBanner = userState.subscriptionPlan === 'premium';

  const tabBarHidden = useTabBarHidden();
  const lastOffset = useSharedValue(0);

  const title = t(`${screen}.title`);
  const subtitle = t(`${screen}.subtitle`);

  // Keep the screen viewport above the floating tab bar, and leave room below the scrolled
  // content — the banner now lives inline in the content flow, so it needs no clearance of its own
  const bottomClearance = withTabBar ? TAB_BAR_TOTAL_HEIGHT + insets.bottom : 0;

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

  // Shared chrome (scroll wrapper, title/subtitle, banner) is identical across every state — only
  // the body below it changes, so it's factored into one render function instead of repeating the
  // whole wrapper for each of the three early returns below
  const renderWithChrome = (body: PropsWithChildren['children']) => (
    <Animated.ScrollView
      style={[styles.container, { backgroundColor: Colors.$backgroundDefault }]}
      contentContainerStyle={{ paddingBottom: bottomClearance + GENERAL_MARGIN }}
      onScroll={handleScroll}
      scrollEventThrottle={16}>
      <View style={{ minHeight: height - headerHeight - bottomClearance }}>
        <Spacing y={20} />
        {title !== `${screen}.title` && (
          <Text h1 $textDefault>
            {title}
          </Text>
        )}
        {title !== `${screen}.title` && subtitle !== `${screen}.subtitle` && <Spacing y={5} />}
        {subtitle !== `${screen}.subtitle` && (
          <Text text80L $textNeutral>
            {t(`${screen}.subtitle`)}
          </Text>
        )}
        {title !== `${screen}.title` && subtitle !== `${screen}.subtitle` && <Spacing y={10} />}
        {!hideBanner && (
          <>
            <AppBannerAd style={styles.banner} />
            <Spacing y={10} />
          </>
        )}
        {body}
      </View>
    </Animated.ScrollView>
  );

  if (loadingMessage) {
    return renderWithChrome(
      <View style={styles.centerMessage}>
        <ActivityIndicator color={Colors.$backgroundPrimaryHeavy} size="large" />
        <Spacing y={12} />
        <Text $textDefault>{loadingMessage}</Text>
      </View>,
    );
  }

  if (errorMessage) {
    return renderWithChrome(
      <View style={styles.centerMessage}>
        <Text $textDefault center>
          {errorMessage}
        </Text>
      </View>,
    );
  }

  return renderWithChrome(children);
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  banner: {
    alignItems: 'center',
  },
  centerMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
