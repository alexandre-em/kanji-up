import React, { useEffect, useState } from 'react';

import { ColorType } from 'kanji-app-types';

const ColorContext = React.createContext<ColorType | null>(null);

// This hook can be used to access the user info.
export function useColor() {
  return React.useContext(ColorContext);
}

export function ColorProvider({ colors, children }: { colors: ColorType; children: React.ReactNode }) {
  const [colorState, setColorState] = useState<ColorType | null>(null);

  useEffect(() => {
    if (!colorState) setColorState(colors);
  }, [colorState, colors]);

  return <ColorContext.Provider value={colorState}>{children}</ColorContext.Provider>;
}
