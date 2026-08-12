import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from 'react-native-ui-lib';

import { tabs } from '../constants/tabs';
import { useTabBarHidden } from '../providers/tabBar';
import TabLabel from './tabLabel';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BAR_HEIGHT = 68;
const BAR_MARGIN_BOTTOM = 20;
const BAR_MARGIN_HORIZONTAL = 16;
const PILL_HEIGHT = 56;
const ICON_SIZE = 22;
const SPRING = { damping: 18, stiffness: 220 };
// Inverted bar: brand red background, white content
const BAR_COLOR = Colors.$backgroundPrimaryHeavy + 'e6'; // slightly translucent so content shows through
const ACTIVE_COLOR = '#fff';
const INACTIVE_COLOR = '#ffffffaa';
const PILL_COLOR = '#ffffff33';

/** Vertical room the floating bar takes: consumed by Layout to keep content reachable above it */
export const TAB_BAR_TOTAL_HEIGHT = BAR_HEIGHT + BAR_MARGIN_BOTTOM;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabLayout = {
  x: number;
  width: number;
};

type BottomNavBarProps = {
  /** Name of the current route, matched against the tab keys */
  activeRoute?: string;
  onTabPress: (route: string) => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function BottomNavBar({ activeRoute, onTabPress }: BottomNavBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHidden = useTabBarHidden();
  // Tabs are sized by their content (the active one also shows a label), so the pill
  // follows the measured layout instead of a computed screen fraction
  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});

  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  const activeLayout = activeRoute ? layouts[activeRoute] : undefined;

  useEffect(() => {
    if (!activeLayout) return;

    if (pillOpacity.value === 0) {
      // First measure: place the pill where it belongs instead of sliding it in from the left edge
      pillX.value = activeLayout.x;
      pillWidth.value = activeLayout.width;
      pillOpacity.value = withTiming(1, { duration: 150 });
      return;
    }

    pillX.value = withSpring(activeLayout.x, SPRING);
    pillWidth.value = withSpring(activeLayout.width, SPRING);
  }, [activeLayout, pillOpacity, pillWidth, pillX]);

  const pillStyle = useAnimatedStyle(() => ({
    width: pillWidth.value,
    opacity: pillOpacity.value,
    transform: [{ translateX: pillX.value }],
  }));

  // Slides the whole bar out below the screen when the user scrolls down
  const hiddenOffset = BAR_HEIGHT + BAR_MARGIN_BOTTOM + insets.bottom;
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (tabBarHidden?.value ?? 0) * hiddenOffset }],
  }));

  const handleTabLayout = useCallback((key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    setLayouts((previous) => {
      const known = previous[key];

      if (known?.x === x && known?.width === width) return previous;

      return { ...previous, [key]: { x, width } };
    });
  }, []);

  return (
    <Animated.View style={[styles.bar, { bottom: insets.bottom + BAR_MARGIN_BOTTOM }, barStyle]}>
      <Animated.View style={[styles.pill, pillStyle]} />

      {tabs.map((tab) => {
        const isActive = tab.key === activeRoute;
        const label = t(tab.labelKey);

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.key)}
            onLayout={(event) => handleTabLayout(tab.key, event)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}>
            {tab.icon({ size: ICON_SIZE, color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR })}
            {isActive && <TabLabel label={label} />}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: BAR_MARGIN_HORIZONTAL,
    right: BAR_MARGIN_HORIZONTAL,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: BAR_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    backgroundColor: PILL_COLOR,
  },
  tab: {
    height: PILL_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
