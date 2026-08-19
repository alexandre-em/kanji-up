import React, { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native-ui-lib';

import { THEME_OVERRIDE_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValueType = {
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = React.createContext<ThemeContextValueType>({
  preference: 'system',
  isDark: false,
  setPreference: () => {},
});

export function useThemePreference() {
  return React.useContext(ThemeContext);
}

function resolveIsDark(preference: ThemePreference, systemTheme: ReturnType<typeof useColorScheme>): boolean {
  return preference === 'system' ? systemTheme === 'dark' : preference === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const isDark = resolveIsDark(preference, systemTheme);

  // A theme picked manually in Settings must survive app restarts, otherwise it silently reverts
  // to following the device theme on next launch — this is what makes that choice stick
  useEffect(() => {
    fileServiceInstance.read(THEME_OVERRIDE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') setPreferenceState(stored);
    });
  }, []);

  // Colors.setScheme() must land before the render batch it's meant to affect, not after — e.g. a
  // toast shown right after picking a theme (same event handler) needs the new colors immediately,
  // not a render later. Calling it here, synchronously inside the event-handler-triggered setter,
  // guarantees that: it runs before React even starts the batched render for this update, and it's
  // safe because it's an event handler, not a render function (that distinction is exactly what
  // caused "cannot update during render" when this used to live in App.tsx's render body).
  const setPreference = useCallback(
    (next: ThemePreference) => {
      Colors.setScheme(resolveIsDark(next, systemTheme) ? 'dark' : 'light');
      setPreferenceState(next);
      fileServiceInstance.write(THEME_OVERRIDE_KEY, next);
    },
    [systemTheme],
  );

  // Keeps RNUI's own scheme in sync with isDark for the two cases setPreference's synchronous call
  // doesn't cover: the device's Appearance changing while "system" is selected (no event handler
  // to piggy-back on), and restoring a stored preference on boot (the read above only updates
  // React state — without this, an explicit dark/light override never re-applied Colors.setScheme
  // on launch, so the app rendered light regardless of what was saved until reselected in Settings)
  useEffect(() => {
    Colors.setScheme(isDark ? 'dark' : 'light');
  }, [isDark]);

  return <ThemeContext.Provider value={{ preference, isDark, setPreference }}>{children}</ThemeContext.Provider>;
}
