import React from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

/**
 * Progress of the floating tab bar hiding animation: 0 fully visible, 1 slid out below the screen.
 * Shared between the scrolling screens (Layout) and the bar itself, so it stays on the UI thread.
 */
const TabBarContext = React.createContext<SharedValue<number> | null>(null);

export function useTabBarHidden() {
  return React.useContext(TabBarContext);
}

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const hidden = useSharedValue(0);

  return <TabBarContext.Provider value={hidden}>{children}</TabBarContext.Provider>;
}
