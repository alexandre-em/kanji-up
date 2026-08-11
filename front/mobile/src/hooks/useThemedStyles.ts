import { useMemo } from 'react';

import { useThemePreference } from '../providers/theme';

// A `Colors.$xxx` token read inside a module-level StyleSheet.create only ever evaluates once,
// at import time — it never picks up a later theme change. Wrapping the same factory in this
// hook re-runs it whenever isDark flips, so the styles stay correct after a light/dark switch.
export function useThemedStyles<T>(factory: () => T): T {
  const { isDark } = useThemePreference();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [isDark]);
}
