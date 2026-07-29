import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface NavTab {
  key: string;
  label: string;
  /** Pass any icon component renderer — e.g. from @expo/vector-icons or lucide-react-native */
  icon: (props: { color: string; size: number; filled: boolean }) => React.ReactNode;
  badge?: number; // optional notification badge count
}

interface BottomNavBarProps {
  tabs: NavTab[];
  initialTab?: string;
  onTabChange?: (key: string) => void;
  /** Accent colour used for the active pill + icon */
  accentColor?: string;
  /** Background colour of the bar */
  backgroundColor?: string;
  /** Label colour when inactive */
  inactiveColor?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_HEIGHT = 64;
const PILL_HEIGHT = 46;
const PILL_RADIUS = 23;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const BottomNavBar: React.FC<BottomNavBarProps> = ({
  tabs,
  initialTab,
  onTabChange,
  accentColor = '#6C63FF',
  backgroundColor = '#0F0F14',
  inactiveColor = '#5A5A72',
}) => {
  const insets = useSafeAreaInsets();
  const [activeKey, setActiveKey] = useState(initialTab ?? tabs[0]?.key);

  // One Animated.Value per tab for icon scale + label fade
  const scaleAnims = useRef<Record<string, Animated.Value>>({});
  const labelAnims = useRef<Record<string, Animated.Value>>({});
  // Sliding pill X position
  const pillX = useRef(new Animated.Value(0)).current;

  // Initialise per-tab animations
  tabs.forEach((t) => {
    if (!scaleAnims.current[t.key]) {
      scaleAnims.current[t.key] = new Animated.Value(t.key === activeKey ? 1 : 0.85);
    }
    if (!labelAnims.current[t.key]) {
      labelAnims.current[t.key] = new Animated.Value(t.key === activeKey ? 1 : 0);
    }
  });

  const tabWidth = SCREEN_WIDTH / tabs.length;

  // Drive pill to the correct position on mount
  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === activeKey);
    pillX.setValue(idx * tabWidth + tabWidth / 2 - 52); // 52 = half pill width
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = (key: string) => {
    if (key === activeKey) return;

    const prevKey = activeKey;
    const nextIdx = tabs.findIndex((t) => t.key === key);

    setActiveKey(key);
    onTabChange?.(key);

    // Slide pill
    Animated.spring(pillX, {
      toValue: nextIdx * tabWidth + tabWidth / 2 - 52,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
    }).start();

    // Animate outgoing tab
    Animated.parallel([
      Animated.spring(scaleAnims.current[prevKey], {
        toValue: 0.85,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.timing(labelAnims.current[prevKey], {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate incoming tab
    Animated.parallel([
      Animated.spring(scaleAnims.current[key], {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 260,
      }),
      Animated.timing(labelAnims.current[key], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor,
          paddingBottom: insets.bottom,
          height: BAR_HEIGHT + insets.bottom,
        },
      ]}>
      {/* Sliding pill background */}
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: accentColor + '22', // ~13 % opacity tint
            borderColor: accentColor + '44',
            transform: [{ translateX: pillX }],
          },
        ]}
      />

      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const scale = scaleAnims.current[tab.key];
        const labelOpacity = labelAnims.current[tab.key];
        const iconColor = isActive ? accentColor : inactiveColor;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { width: tabWidth }]}
            activeOpacity={0.7}
            onPress={() => handlePress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}>
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale }] }]}>
              {tab.icon({ color: iconColor, size: 22, filled: isActive })}

              {/* Badge */}
              {tab.badge != null && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              )}
            </Animated.View>

            {/* Label — fades in when active */}
            <Animated.Text
              style={[
                styles.label,
                {
                  color: accentColor,
                  opacity: labelOpacity,
                  transform: [
                    {
                      translateY: labelOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, 0],
                      }),
                    },
                  ],
                },
              ]}
              numberOfLines={1}>
              {tab.label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    // Subtle top shadow on iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  pill: {
    position: 'absolute',
    top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
    width: 104,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
  },
  tab: {
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#0F0F14',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 13,
  },
});

export default BottomNavBar;

// ---------------------------------------------------------------------------
// USAGE EXAMPLE
// ---------------------------------------------------------------------------
//
// import { Feather } from '@expo/vector-icons';
// import BottomNavBar, { NavTab } from './BottomNavBar';
//
// const TABS: NavTab[] = [
//   {
//     key: 'home',
//     label: 'Home',
//     icon: ({ color, size, filled }) =>
//       <Feather name={filled ? 'home' : 'home'} size={size} color={color} />,
//   },
//   {
//     key: 'explore',
//     label: 'Explore',
//     icon: ({ color, size }) =>
//       <Feather name="compass" size={size} color={color} />,
//   },
//   {
//     key: 'inbox',
//     label: 'Inbox',
//     icon: ({ color, size }) =>
//       <Feather name="bell" size={size} color={color} />,
//     badge: 3,
//   },
//   {
//     key: 'profile',
//     label: 'Profile',
//     icon: ({ color, size }) =>
//       <Feather name="user" size={size} color={color} />,
//   },
// ];
//
// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <View style={{ flex: 1 }}>
//         {/* your screens here */}
//         <BottomNavBar
//           tabs={TABS}
//           accentColor="#6C63FF"
//           onTabChange={(key) => console.log('active tab:', key)}
//         />
//       </View>
//     </SafeAreaProvider>
//   );
// }
